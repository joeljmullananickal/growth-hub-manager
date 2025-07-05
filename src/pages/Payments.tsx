import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { usePayments, Payment } from '@/hooks/usePayments';
import { useClients } from '@/hooks/useClients';
import { Edit, Trash, IndianRupee,} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useLocation } from 'react-router-dom';

export default function Payments() {
  const { payments, loading, createPayment, updatePayment, deletePayment } = usePayments();
  const { clients } = useClients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    subscription_plan: 'monthly' as 'monthly' | '3_month' | '6_month' | 'yearly',
    currency: 'INR',
    need_gst_bill: false,
    commission: '',
    payment_remarks: '',
    last_paid_date: '',
    last_paid_amount: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid' | 'invoiced',
  });

  const location = useLocation();

  // Parse query params
  const params = new URLSearchParams(location.search);
  const renewals = params.get('renewals');
  const paid = params.get('paid');
  const unpaid = params.get('unpaid');
  const followup = params.get('followup');

  // Get current date info
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);

  // Filter payments based on query params
  let filteredPayments = payments;

  if (renewals === 'thisMonth') {
    filteredPayments = payments.filter(p => {
      if (!p.next_renewal_date) return false;
      const renewalDate = new Date(p.next_renewal_date);
      return (
        renewalDate.getMonth() === currentMonth &&
        renewalDate.getFullYear() === currentYear
      );
    });
  } else if (paid === 'thisMonth') {
    filteredPayments = payments.filter(p => {
      if (!p.last_paid_date) return false;
      const paidDate = new Date(p.last_paid_date);
      return (
        paidDate.getMonth() === currentMonth &&
        paidDate.getFullYear() === currentYear &&
        p.payment_status === 'paid'
      );
    });
  } else if (unpaid === 'previousMonth') {
    filteredPayments = payments.filter(p => {
      if (!p.next_renewal_date) return false;
      const renewalDate = new Date(p.next_renewal_date);
      return (
        renewalDate.getMonth() === lastMonth &&
        renewalDate.getFullYear() === lastMonthYear &&
        p.payment_status === 'unpaid'
      );
    });
  } else if (unpaid === 'old') {
    filteredPayments = payments.filter(p => {
      if (!p.next_renewal_date) return false;
      const renewalDate = new Date(p.next_renewal_date);
      return renewalDate < twoMonthsAgo && p.payment_status === 'unpaid';
    });
  } else if (followup === 'due') {
    filteredPayments = payments.filter(
      p => p.payment_status === 'unpaid' || p.payment_status === 'invoiced'
    );
  }


  const resetForm = () => {
    setFormData({
      client_id: '',
      amount: '',
      subscription_plan: 'monthly',
      currency: 'INR',
      need_gst_bill: false,
      commission: '',
      payment_remarks: '',
      last_paid_date: '',
      last_paid_amount: '',
      payment_status: 'unpaid',
    });
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment({
      client_id: formData.client_id,
      amount: parseFloat(formData.amount),
      subscription_plan: formData.subscription_plan,
      currency: formData.currency,
      need_gst_bill: formData.need_gst_bill,
      commission: formData.commission ? parseFloat(formData.commission) : undefined,
      payment_remarks: formData.payment_remarks || undefined,
      last_paid_date: formData.last_paid_date || undefined,
      last_paid_amount: formData.last_paid_amount ? parseFloat(formData.last_paid_amount) : undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    
    await updatePayment(editingPayment.id, {
      client_id: formData.client_id,
      amount: parseFloat(formData.amount),
      subscription_plan: formData.subscription_plan,
      currency: formData.currency,
      need_gst_bill: formData.need_gst_bill,
      commission: formData.commission ? parseFloat(formData.commission) : null,
      payment_remarks: formData.payment_remarks || null,
      last_paid_date: formData.last_paid_date || null,
      last_paid_amount: formData.last_paid_amount ? parseFloat(formData.last_paid_amount) : null,
      payment_status: formData.payment_status,
    });
    setIsEditOpen(false);
    setEditingPayment(null);
    resetForm();
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      client_id: payment.client_id,
      amount: payment.amount.toString(),
      subscription_plan: payment.subscription_plan,
      currency: payment.currency,
      need_gst_bill: payment.need_gst_bill || false,
      commission: payment.commission?.toString() || '',
      payment_remarks: payment.payment_remarks || '',
      last_paid_date: payment.last_paid_date || '',
      last_paid_amount: payment.last_paid_amount?.toString() || '',
      payment_status: payment.payment_status,
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      unpaid: 'destructive',
      invoiced: 'secondary',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const labels = {
      monthly: 'Monthly',
      '3_month': '3 Months',
      '6_month': '6 Months',
      yearly: 'Yearly',
    };
    return <Badge variant="outline">{labels[plan as keyof typeof labels]}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading payments...</div>;
  }

  return (
    <div className="space-y-6 font-inter animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button
          onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
          className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
        >
          Add Payment
        </Button>
      </div>
      <Card className="rounded-xl shadow-soft transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <TableCell className="font-medium">{payment.clients.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {payment.total_amount} {payment.currency}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                  <TableCell>
                    {payment.last_paid_date ? format(parseISO(payment.last_paid_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(payment)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deletePayment(payment.id)}>
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-xl shadow-soft animate-fade-in">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            {/* --- Your form fields here, similar to the edit form --- */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_id">Client</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.contact_person_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscription_plan">Subscription Plan</Label>
                <Select value={formData.subscription_plan} onValueChange={(value: 'monthly' | '3_month' | '6_month' | 'yearly') => setFormData({...formData, subscription_plan: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="3_month">3 Months</SelectItem>
                    <SelectItem value="6_month">6 Months</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  required
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="need_gst_bill"
                checked={formData.need_gst_bill}
                onCheckedChange={(checked) => setFormData({...formData, need_gst_bill: !!checked})}
              />
              <Label htmlFor="need_gst_bill">Need GST Bill</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commission">Commission</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => setFormData({...formData, commission: e.target.value})}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="last_paid_amount">Last Paid Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.last_paid_amount}
                  onChange={(e) => setFormData({...formData, last_paid_amount: e.target.value})}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="last_paid_date">Last Paid Date</Label>
              <Input
                type="date"
                value={formData.last_paid_date}
                onChange={(e) => setFormData({...formData, last_paid_date: e.target.value})}
                className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="payment_remarks">Remarks</Label>
              <Textarea
                value={formData.payment_remarks}
                onChange={(e) => setFormData({...formData, payment_remarks: e.target.value})}
                placeholder="Add any remarks..."
                className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg">
              Add Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_id">Client</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.contact_person_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscription_plan">Subscription Plan</Label>
                <Select value={formData.subscription_plan} onValueChange={(value: 'monthly' | '3_month' | '6_month' | 'yearly') => setFormData({...formData, subscription_plan: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="3_month">3 Months</SelectItem>
                    <SelectItem value="6_month">6 Months</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(value: 'paid' | 'unpaid' | 'invoiced') => setFormData({...formData, payment_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commission">Commission</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => setFormData({...formData, commission: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="last_paid_amount">Last Paid Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.last_paid_amount}
                  onChange={(e) => setFormData({...formData, last_paid_amount: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="last_paid_date">Last Paid Date</Label>
              <Input
                type="date"
                value={formData.last_paid_date}
                onChange={(e) => setFormData({...formData, last_paid_date: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="need_gst_bill"
                checked={formData.need_gst_bill}
                onCheckedChange={(checked) => setFormData({...formData, need_gst_bill: !!checked})}
              />
              <Label htmlFor="need_gst_bill">Need GST Bill</Label>
            </div>

            <div>
              <Label htmlFor="payment_remarks">Remarks</Label>
              <Textarea
                value={formData.payment_remarks}
                onChange={(e) => setFormData({...formData, payment_remarks: e.target.value})}
                placeholder="Add any remarks..."
              />
            </div>

            <Button type="submit" className="w-full">Update Payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}