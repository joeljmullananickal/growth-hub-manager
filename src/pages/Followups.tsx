import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFollowups, Followup } from '@/hooks/useFollowups';
import { useClients } from '@/hooks/useClients';
import { Edit, Trash, Plus, Phone, Mail, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useLocation } from 'react-router-dom';

export default function Followups() {
  const { followups, loading, createFollowup, updateFollowup, deleteFollowup, generateRenewalFollowups } = useFollowups();
  const { clients } = useClients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    payment_id: '',
    followup_mode: 'phone' as 'phone' | 'whatsapp' | 'email',
    next_followup_date: '',
    followup_remarks: '',
    followup_status: 'pending' as 'pending' | 'completed' | 'scheduled',
  });

const location = useLocation();
const params = new URLSearchParams(location.search);
const status = params.get('status'); 
  // Example filtering logic:
let filteredFollowups = followups;
if (status) {
  filteredFollowups = filteredFollowups.filter(f => f.followup_status === status);
}


  const resetForm = () => {
    setFormData({
      client_id: '',
      payment_id: '',
      followup_mode: 'phone',
      next_followup_date: '',
      followup_remarks: '',
      followup_status: 'pending',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFollowup({
      client_id: formData.client_id,
      payment_id: formData.payment_id || undefined,
      followup_mode: formData.followup_mode,
      next_followup_date: formData.next_followup_date || undefined,
      followup_remarks: formData.followup_remarks || undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFollowup) return;
    
    await updateFollowup(editingFollowup.id, {
      client_id: formData.client_id,
      payment_id: formData.payment_id || null,
      followup_mode: formData.followup_mode,
      next_followup_date: formData.next_followup_date || null,
      followup_remarks: formData.followup_remarks || null,
      followup_status: formData.followup_status,
    });
    setIsEditOpen(false);
    setEditingFollowup(null);
    resetForm();
  };

  const openEditDialog = (followup: Followup) => {
    setEditingFollowup(followup);
    setFormData({
      client_id: followup.client_id,
      payment_id: followup.payment_id || '',
      followup_mode: followup.followup_mode,
      next_followup_date: followup.next_followup_date || '',
      followup_remarks: followup.followup_remarks || '',
      followup_status: followup.followup_status,
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'destructive',
      completed: 'default',
      scheduled: 'secondary',
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getModeBadge = (mode: string) => {
    const icons = {
      phone: <Phone className="w-3 h-3" />,
      whatsapp: <Phone className="w-3 h-3" />,
      email: <Mail className="w-3 h-3" />,
    };
    return (
      <div className="flex items-center gap-1">
        {icons[mode as keyof typeof icons]}
        {mode}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading followups...</div>;
  }

  return (
    <div className="space-y-6 font-inter animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Follow-ups</h1>
        <div className="flex gap-2">
          <Button
            onClick={generateRenewalFollowups}
            variant="outline"
            className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Renewal Followups
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Followup
              </Button>
            </DialogTrigger>
          <DialogContent className="rounded-xl shadow-soft animate-fade-in">
            <DialogHeader>
              <DialogTitle>Create New Followup</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
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
                <Label htmlFor="followup_mode">Followup Mode</Label>
                <Select value={formData.followup_mode} onValueChange={(value: 'phone' | 'whatsapp' | 'email') => setFormData({...formData, followup_mode: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="next_followup_date">Next Followup Date</Label>
                <Input
                  type="date"
                  value={formData.next_followup_date}
                  onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <Label htmlFor="followup_remarks">Remarks</Label>
                <Textarea
                  value={formData.followup_remarks}
                  onChange={(e) => setFormData({...formData, followup_remarks: e.target.value})}
                  placeholder="Add any remarks..."
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg">Create Followup</Button>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-xl shadow-soft transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
        <CardHeader>
          <CardTitle>All Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Followup</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFollowups.map((followup) => (
                <TableRow key={followup.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <TableCell className="font-medium">{followup.clients.name}</TableCell>
                  <TableCell>{followup.clients.contact_person_name}</TableCell>
                  <TableCell>
                    <Badge variant={followup.followup_type === 'payment_renewal' ? 'default' : 'secondary'}>
                      {followup.followup_type === 'payment_renewal' ? 'Payment Renewal' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getModeBadge(followup.followup_mode)}</TableCell>
                  <TableCell>{getStatusBadge(followup.followup_status)}</TableCell>
                  <TableCell>
                    {followup.next_followup_date ? format(parseISO(followup.next_followup_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{followup.followup_remarks || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(followup)} className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteFollowup(followup.id)} className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg">
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
        <DialogContent className="rounded-xl shadow-soft animate-fade-in">
          <DialogHeader>
            <DialogTitle>Edit Followup</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
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
              <Label htmlFor="followup_mode">Followup Mode</Label>
              <Select value={formData.followup_mode} onValueChange={(value: 'phone' | 'whatsapp' | 'email') => setFormData({...formData, followup_mode: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="followup_status">Status</Label>
              <Select value={formData.followup_status} onValueChange={(value: 'pending' | 'completed' | 'scheduled') => setFormData({...formData, followup_status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="next_followup_date">Next Followup Date</Label>
              <Input
                type="date"
                value={formData.next_followup_date}
                onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="followup_remarks">Remarks</Label>
              <Textarea
                value={formData.followup_remarks}
                onChange={(e) => setFormData({...formData, followup_remarks: e.target.value})}
                placeholder="Add any remarks..."
                className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg">Update Followup</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}