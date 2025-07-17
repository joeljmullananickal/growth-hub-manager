import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

interface DashboardStats {
  activeClients: number;
  discontinuedClients: number;
  newClientsThisMonth: number;
  thisMonthRenewals: number;
  thisMonthPaid: number;
  previousMonthUnpaid: number;
  oldUnpaid: number;
  needFollowup: number;
  newLeads: number;
  leadsToFollowup: number;
  veryHotLeads: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0,
    discontinuedClients: 0,
    newClientsThisMonth: 0,
    thisMonthRenewals: 0,
    thisMonthPaid: 0,
    previousMonthUnpaid: 0,
    oldUnpaid: 0,
    needFollowup: 0,
    newLeads: 0,
    leadsToFollowup: 0,
    veryHotLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch client stats
        const { data: clients } = await supabase
          .from('clients')
          .select('status, onboard_date');

        const activeClients = clients?.filter(c => c.status === 'active').length || 0;
        const discontinuedClients = clients?.filter(c => c.status === 'discontinued').length || 0;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newClientsThisMonth = clients?.filter(c => {
          const onboardDate = new Date(c.onboard_date);
          return onboardDate.getMonth() === currentMonth && onboardDate.getFullYear() === currentYear;
        }).length || 0;

        // Fetch payment stats
        const { data: payments } = await supabase
          .from('payments')
          .select('payment_status, next_renewal_date, last_paid_date');

        const thisMonthRenewals = payments?.filter(p => {
          if (!p.next_renewal_date) return false;
          const renewalDate = new Date(p.next_renewal_date);
          return renewalDate.getMonth() === currentMonth && renewalDate.getFullYear() === currentYear;
        }).length || 0;

        const thisMonthPaid = payments?.filter(p => {
          if (!p.last_paid_date) return false;
          const paidDate = new Date(p.last_paid_date);
          return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear && p.payment_status === 'paid';
        }).length || 0;

        const previousMonthUnpaid = payments?.filter(p => {
          if (!p.next_renewal_date) return false;
          const renewalDate = new Date(p.next_renewal_date);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return renewalDate.getMonth() === lastMonth && renewalDate.getFullYear() === lastMonthYear && p.payment_status === 'unpaid';
        }).length || 0;

        const oldUnpaid = payments?.filter(p => {
          if (!p.next_renewal_date) return false;
          const renewalDate = new Date(p.next_renewal_date);
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          return renewalDate < twoMonthsAgo && p.payment_status === 'unpaid';
        }).length || 0;

        // Fetch followup stats

        const needFollowup = payments?.filter(
        p => p.payment_status === 'unpaid' || p.payment_status === 'invoiced'
        ).length || 0;

        // Fetch leads stats
        const { data: leads } = await supabase
          .from('leads')
          .select('status, next_followup_date, created_at');

        const newLeads = leads?.filter(l => {
          const createdDate = new Date(l.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length || 0;

        const leadsToFollowup = leads?.filter(l => 
          l.next_followup_date && new Date(l.next_followup_date) <= new Date()
        ).length || 0;

        const veryHotLeads = leads?.filter(l => l.status === 'very_hot').length || 0;

        setStats({
          activeClients,
          discontinuedClients,
          newClientsThisMonth,
          thisMonthRenewals,
          thisMonthPaid,
          previousMonthUnpaid,
          oldUnpaid,
          needFollowup,
          newLeads,
          leadsToFollowup,
          veryHotLeads,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'activeClients':
        navigate('/clients?status=active');
        break;
      case 'discontinuedClients':
        navigate('/clients?status=discontinued');
        break;
      case 'newClientsThisMonth':
        navigate('/clients?period=thisMonth');
        break;
      case 'thisMonthRenewals':
        navigate('/payments?renewals=thisMonth');
        break;
      case 'thisMonthPaid':
        navigate('/payments?paid=thisMonth');
        break;
      case 'previousMonthUnpaid':
        navigate('/payments?unpaid=previousMonth');
        break;
      case 'oldUnpaid':
        navigate('/payments?unpaid=old');
        break;
      case 'needFollowup':
        navigate('/payments?followup=due');
        break;
      case 'newLeads':
        navigate('/leads?period=thisMonth');
        break;
      case 'leadsToFollowup':
        navigate('/followups?leadFollowup=due');
        break;
      case 'veryHotLeads':
        navigate('/leads?status=very_hot');
        break;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  const dashboardCards = [
    { title: 'Active Clients', value: stats.activeClients, key: 'activeClients', color: 'text-primary' },
    { title: 'Discontinued Clients', value: stats.discontinuedClients, key: 'discontinuedClients', color: 'text-destructive' },
    { title: 'New Clients This Month', value: stats.newClientsThisMonth, key: 'newClientsThisMonth', color: 'text-primary' },
    { title: 'This Month Renewals', value: stats.thisMonthRenewals, key: 'thisMonthRenewals', color: 'text-accent-foreground' },
    { title: 'This Month Paid', value: stats.thisMonthPaid, key: 'thisMonthPaid', color: 'text-primary' },
    { title: 'Previous Month Unpaid', value: stats.previousMonthUnpaid, key: 'previousMonthUnpaid', color: 'text-destructive' },
    { title: 'Old Unpaid', value: stats.oldUnpaid, key: 'oldUnpaid', color: 'text-destructive' },
    { title: 'Need Followup - Payments', value: stats.needFollowup, key: 'needFollowup', color: 'text-accent-foreground' },
    { title: 'New Leads', value: stats.newLeads, key: 'newLeads', color: 'text-primary' },
    { title: 'Leads to Followup', value: stats.leadsToFollowup, key: 'leadsToFollowup', color: 'text-accent-foreground' },
    { title: 'Very Hot Leads', value: stats.veryHotLeads, key: 'veryHotLeads', color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-cover bg-center relative animate-fade-in space-y-6 font-inter" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="relative z-10 flex items-center justify-between mb-8 px-8 pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-500 drop-shadow-lg font-playfair animate-bounce-in">Dashboard</h1>
      </div>
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-8 pb-12">
        {dashboardCards.map((card) => (
          <Card
            key={card.key}
            className="cursor-pointer rounded-xl shadow-soft glass transition-transform duration-200 hover:scale-105 hover:shadow-lg hover-lift"
            onClick={() => handleCardClick(card.key)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}