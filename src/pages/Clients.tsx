import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useClients, Client } from '@/hooks/useClients';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // Add this import for a delete icon
import sectionBg from '@/assets/section-bg.jpg';

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Japan', 'India', 'Brazil', 'Mexico', 'Spain', 'Italy'
];

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [searchParams] = useSearchParams();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    state: '',
    place: '',
    currency: 'USD',
    no_of_branches: 1,
    activated_tax_module: false,
    gst_number: '',
    contact_person_name: '',
    contact_number_1: '',
    contact_number_2: '',
    email_id: '',
    reference: '',
    onboard_date: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'discontinued' | 'hold',
    discontinue_reason: '',
  });
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    // Handle URL parameters for filtering
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    
    if (status && status !== 'all') {
      setStatusFilter(status);
    }
  }, [searchParams]);

  // Enhanced filtering logic
  useEffect(() => {
    let filtered = clients;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (countryFilter !== 'all') {
      filtered = filtered.filter((c) => c.country === countryFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.gst_number && c.gst_number.toLowerCase().includes(term))
      );
    }

    setFilteredClients(filtered);
  }, [clients, statusFilter, countryFilter, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.status !== 'active' && !formData.discontinue_reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for discontinuation/hold",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        await addClient(formData);
        toast({
          title: "Success",
          description: "Client added successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      state: '',
      place: '',
      currency: 'USD',
      no_of_branches: 1,
      activated_tax_module: false,
      gst_number: '',
      contact_person_name: '',
      contact_number_1: '',
      contact_number_2: '',
      email_id: '',
      reference: '',
      onboard_date: new Date().toISOString().split('T')[0],
      status: 'active',
      discontinue_reason: '',
    });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      country: client.country,
      state: client.state || '',
      place: client.place || '',
      currency: client.currency,
      no_of_branches: client.no_of_branches,
      activated_tax_module: client.activated_tax_module,
      gst_number: client.gst_number || '',
      contact_person_name: client.contact_person_name,
      contact_number_1: client.contact_number_1,
      contact_number_2: client.contact_number_2 || '',
      email_id: client.email_id || '',
      reference: client.reference || '',
      onboard_date: client.onboard_date,
      status: client.status,
      discontinue_reason: client.discontinue_reason || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    setDeletingClientId(clientId);
    try {
      await deleteClient(clientId);
      toast({
        title: "Deleted",
        description: "Client deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    } finally {
      setDeletingClientId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-primary text-primary-foreground',
      discontinued: 'bg-destructive text-destructive-foreground',
      hold: 'bg-secondary text-secondary-foreground',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  if (loading) {
    return(
      <div className="flex items-center justify-center h-64">Loading clients...</div>
    );
  }

  return (
    <div className="min-h-0 flex flex-col bg-cover relative animate-fade-in font-inter" style={{ backgroundImage: `url(${sectionBg})` }}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 sticky top-0 z-10 backdrop-blur border-b w-full min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-500 drop-shadow-2xl font-playfair animate-bounce-in truncate" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>Clients</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (open && !editingClient) resetForm();
          if (!open) setEditingClient(null);
        }}>
          <DialogTrigger asChild>
            <Button variant="black" className="min-w-0 w-auto h-10 px-4 text-sm rounded-lg transition-transform duration-150 hover:scale-105 hover:shadow-lg">Add Client</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-xl shadow-soft animate-fade-in top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger className="rounded-xl transition-all duration-200">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                    <SelectItem value="Mexico">Mexico</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="place" className="text-sm font-medium">Place</Label>
                <Input
                  id="place"
                  name="place"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="rounded-xl transition-all duration-200">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="no_of_branches" className="text-sm font-medium">Number of Branches</Label>
                <Input
                  type="number"
                  id="no_of_branches"
                  name="no_of_branches"
                  value={formData.no_of_branches}
                  onChange={(e) => setFormData({ ...formData, no_of_branches: parseInt(e.target.value, 10) })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="activated_tax_module" className="text-sm font-medium">Activated Tax Module</Label>
                <Select value={formData.activated_tax_module ? 'true' : 'false'} onValueChange={(value) => setFormData({ ...formData, activated_tax_module: value === 'true' })}>
                  <SelectTrigger className="rounded-xl transition-all duration-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gst_number" className="text-sm font-medium">GST Number</Label>
                <Input
                  id="gst_number"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact_person_name" className="text-sm font-medium">Contact Person Name</Label>
                <Input
                  id="contact_person_name"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact_number_1" className="text-sm font-medium">Contact Number 1</Label>
                <Input
                  id="contact_number_1"
                  name="contact_number_1"
                  value={formData.contact_number_1}
                  onChange={(e) => setFormData({ ...formData, contact_number_1: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact_number_2" className="text-sm font-medium">Contact Number 2</Label>
                <Input
                  id="contact_number_2"
                  name="contact_number_2"
                  value={formData.contact_number_2}
                  onChange={(e) => setFormData({ ...formData, contact_number_2: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="email_id" className="text-sm font-medium">Email ID</Label>
                <Input
                  type="email"
                  id="email_id"
                  name="email_id"
                  value={formData.email_id}
                  onChange={(e) => setFormData({ ...formData, email_id: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="reference" className="text-sm font-medium">Reference</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="onboard_date" className="text-sm font-medium">Onboard Date</Label>
                <Input
                  type="date"
                  id="onboard_date"
                  name="onboard_date"
                  value={formData.onboard_date}
                  onChange={(e) => setFormData({ ...formData, onboard_date: e.target.value })}
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'discontinued' | 'hold' })}>
                  <SelectTrigger className="rounded-xl transition-all duration-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                    <SelectItem value="hold">Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.status !== 'active' && (
                <div>
                  <Label htmlFor="discontinue_reason" className="text-sm font-medium">Discontinue Reason</Label>
                  <Input
                    id="discontinue_reason"
                    name="discontinue_reason"
                    value={formData.discontinue_reason}
                    onChange={(e) => setFormData({ ...formData, discontinue_reason: e.target.value })}
                    className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              <Button type="submit" className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg w-full sm:w-auto">
                {editingClient ? 'Update Client' : 'Add Client'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-auto w-full max-w-6xl mx-auto px-6 pb-12 pt-8">
        <div className="absolute inset-0 bg-gradient-hero opacity-60 animate-morphing pointer-events-none"></div>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-2">
          <Input
            placeholder="Search by name or GST number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary w-56"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-xl transition-all duration-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-40 rounded-xl transition-all duration-200">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer rounded-xl shadow-soft bg-white transition-transform duration-200 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(client.status)}>
                      {client.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(client)}
                      className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingClientId === client.id}
                      title="Delete client"
                      className="rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Country:</span> {client.country}
                  </div>
                  <div>
                    <span className="font-medium">GST:</span> {client.gst_number || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {client.contact_person_name}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {client.contact_number_1}
                  </div>
                  <div>
                    <span className="font-medium">Onboard:</span> {new Date(client.onboard_date).toLocaleDateString()}
                  </div>
                </div>
                {client.discontinue_reason && (
                  <div className="mt-2 text-sm text-destructive">
                    <span className="font-medium">Reason:</span> {client.discontinue_reason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No clients found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}