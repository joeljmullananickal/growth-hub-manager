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
import { useLeads, Lead } from '@/hooks/useLeads';
import { Edit, Trash, Plus, Phone, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import wavePatternBg from '@/assets/wave-pattern.jpg';

export default function Leads() {
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_person: '',
    contact_number: '',
    country: '',
    place: '',
    reference: '',
    status: 'warm' as 'very_hot' | 'hot' | 'warm' | 'remove_close',
    status_remarks: '',
    next_followup_date: '',
  });

  const resetForm = () => {
    setFormData({
      customer_name: '',
      contact_person: '',
      contact_number: '',
      country: '',
      place: '',
      reference: '',
      status: 'warm',
      status_remarks: '',
      next_followup_date: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead({
      customer_name: formData.customer_name,
      contact_person: formData.contact_person,
      contact_number: formData.contact_number,
      country: formData.country,
      place: formData.place || undefined,
      reference: formData.reference || undefined,
      status: formData.status,
      status_remarks: formData.status_remarks || undefined,
      next_followup_date: formData.next_followup_date || undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    
    await updateLead(editingLead.id, {
      customer_name: formData.customer_name,
      contact_person: formData.contact_person,
      contact_number: formData.contact_number,
      country: formData.country,
      place: formData.place || null,
      reference: formData.reference || null,
      status: formData.status,
      status_remarks: formData.status_remarks || null,
      next_followup_date: formData.next_followup_date || null,
    });
    setIsEditOpen(false);
    setEditingLead(null);
    resetForm();
  };

  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      customer_name: lead.customer_name,
      contact_person: lead.contact_person,
      contact_number: lead.contact_number,
      country: lead.country,
      place: lead.place || '',
      reference: lead.reference || '',
      status: lead.status,
      status_remarks: lead.status_remarks || '',
      next_followup_date: lead.next_followup_date || '',
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      very_hot: 'destructive',
      hot: 'secondary',
      warm: 'default',
      remove_close: 'outline',
    } as const;
    const labels = {
      very_hot: 'Very Hot',
      hot: 'Hot',
      warm: 'Warm',
      remove_close: 'Remove/Close',
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading leads...</div>;
  }

  return (
    <div className="min-h-screen bg-cover relative animate-fade-in space-y-6 font-inter" style={{ backgroundImage: `url(${wavePatternBg})` }}>
      <div className="flex items-center justify-between h-16 px-6 bg-white/80 sticky top-0 z-10 backdrop-blur border-b">
          <div className="relative">
            <span className="absolute inset-0 rounded-lg -z-10"></span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-500 drop-shadow-2xl font-playfair animate-bounce-in px-4 py-2 rounded-lg" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>Leads</h1>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="black"
            className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      <div className="flex-1 overflow-auto w-full max-w-6xl mx-auto px-6 pb-12 pt-8">
        <Card className="rounded-xl shadow-soft transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <TableCell className="font-medium">{lead.customer_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.contact_number}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      {lead.next_followup_date ? format(parseISO(lead.next_followup_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(lead)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteLead(lead.id)}>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="place">Place</Label>
                  <Input
                    value={formData.place}
                    onChange={(e) => setFormData({...formData, place: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'very_hot' | 'hot' | 'warm' | 'remove_close') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_hot">Very Hot</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="remove_close">Remove/Close</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="next_followup_date">Next Followup Date</Label>
                  <Input
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status_remarks">Status Remarks</Label>
                <Textarea
                  value={formData.status_remarks}
                  onChange={(e) => setFormData({...formData, status_remarks: e.target.value})}
                  placeholder="Add any remarks about the lead status..."
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full">Create Lead</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="place">Place</Label>
                  <Input
                    value={formData.place}
                    onChange={(e) => setFormData({...formData, place: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'very_hot' | 'hot' | 'warm' | 'remove_close') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_hot">Very Hot</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="remove_close">Remove/Close</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="next_followup_date">Next Followup Date</Label>
                  <Input
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status_remarks">Status Remarks</Label>
                <Textarea
                  value={formData.status_remarks}
                  onChange={(e) => setFormData({...formData, status_remarks: e.target.value})}
                  placeholder="Add any remarks about the lead status..."
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full">Update Lead</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}