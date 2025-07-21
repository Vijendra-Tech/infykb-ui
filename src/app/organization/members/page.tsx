"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useDexieOrganizationStore } from '@/store/use-dexie-organization-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Settings, 
  Trash2, 
  Crown, 
  Shield, 
  User,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MembersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useDexieAuthStore();
  const { 
    members, 
    isLoading, 
    loadMembers, 
    inviteMember, 
    updateMemberRole, 
    removeMember 
  } = useDexieOrganizationStore();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    loadMembers();
  }, [isAuthenticated, router, loadMembers]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!inviteEmail || !inviteRole) {
      setError('Please fill in all fields');
      return;
    }

    const result = await inviteMember({ 
      email: inviteEmail, 
      name: inviteEmail, // Using email as name for invitation
      role: inviteRole as 'admin' | 'approver' | 'member'
    });
    if (result.success) {
      setSuccess('Member invited successfully');
      setInviteEmail('');
      setInviteRole('member');
      setIsInviteDialogOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to invite member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const result = await updateMemberRole(userId, newRole as 'admin' | 'approver' | 'member');
    if (result.success) {
      setSuccess('Member role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const result = await removeMember(userId);
    if (result.success) {
      setSuccess('Member removed successfully');
      setMemberToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'approver':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', className: 'bg-yellow-100 text-yellow-800' },
      approver: { label: 'Approver', className: 'bg-blue-100 text-blue-800' },
      member: { label: 'Member', className: 'bg-gray-100 text-gray-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    return (
      <Badge variant="secondary" className={config.className}>
        {getRoleIcon(role)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-10 lg:p-12 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Team Members
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your organization's team members and their roles
            </p>
          </div>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInviteMember}>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="approver">Approver</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Members Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members ({members.length})
              </CardTitle>
              <CardDescription>
                Manage roles and permissions for your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.id === user.id ? (
                            getRoleBadge(member.role)
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(newRole) => handleUpdateRole(member.uuid, newRole)}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="approver">Approver</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.id !== user.id && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setMemberToDelete(member.uuid)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Member</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to remove {member.name} from the organization? 
                                    This action cannot be undone and they will lose access to all projects.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setMemberToDelete(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleRemoveMember(member.uuid)}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? 'Removing...' : 'Remove Member'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Role Permissions
              </CardTitle>
              <CardDescription>
                Understanding different role capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold">Admin</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Manage organization members</li>
                    <li>• Create and manage projects</li>
                    <li>• Approve access requests</li>
                    <li>• Configure model settings</li>
                    <li>• Full organization access</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Approver</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Approve access requests</li>
                    <li>• Manage assigned projects</li>
                    <li>• Add members to projects</li>
                    <li>• View organization analytics</li>
                    <li>• Limited admin capabilities</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold">Member</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Access assigned projects</li>
                    <li>• Request model key access</li>
                    <li>• Use data ingestion features</li>
                    <li>• Participate in chat sessions</li>
                    <li>• Basic user capabilities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
