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
import { Edit, Trash, Plus, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
    currency: 'USD',
    need_gst_bill: false,
    commission: '',
    payment_remarks: '',
    last_paid_date: '',
    last_paid_amount: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid' | 'invoiced',
  });

  const resetForm = () => {
    setFormData({
      client_id: '',
      amount: '',
      subscription_plan: 'monthly',
      currency: 'USD',
      need_gst_bill: false,
      commission: '',
      payment_remarks: '',
      last_paid_date: '',
      last_paid_amount: '',
      payment_status: 'unpaid',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
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
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
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

              <Button type="submit" className="w-full">Create Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Paid</TableHead>
                <TableHead>Next Renewal</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.clients.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {payment.total_amount} {payment.currency}
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(payment.subscription_plan)}</TableCell>
                  <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                  <TableCell>
                    {payment.last_paid_date ? format(parseISO(payment.last_paid_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {payment.next_renewal_date ? format(parseISO(payment.next_renewal_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>{payment.need_gst_bill ? 'Yes' : 'No'}</TableCell>
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