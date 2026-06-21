import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  Edit3,
  Shield,
  CheckCircle2,
  Calendar,
  Package,
  Heart,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../../api/authApi.js';
import { updateUser, setCredentials, selectCurrentUser } from '../../features/auth/authSlice.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog.jsx';
import { apiUrl } from '../../lib/api.js';
import { useGetMyOrdersQuery } from '../../api/apiSlice.js';
import { formatDate } from '../../lib/utils.js';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: z.string().min(7, 'Please enter a valid phone number').optional().or(z.literal('')),
  street: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current',
    path: ['newPassword'],
  });

export const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const localUser = useSelector(selectCurrentUser);
  const accessToken = useSelector((s) => s.auth.accessToken);
  const { data: meData, isLoading, refetch } = useGetMeQuery();
  const user = meData?.data || localUser;
  const { data: ordersData } = useGetMyOrdersQuery();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || '',
      });
    }
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await axios.put(
        apiUrl('/users/profile'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      const updatedUser = { ...user, avatar: res.data.data.avatar };
      dispatch(updateUser(updatedUser));
      dispatch(setCredentials({ user: updatedUser, accessToken }));
      toast.success('Avatar updated!');
      setAvatarFile(null);
      setAvatarPreview(null);
      refetch();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmitProfile = async (data) => {
    setIsSaving(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
      };
      const res = await axios.put(
        apiUrl('/users/profile'),
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      const updatedUser = res.data.data;
      dispatch(updateUser(updatedUser));
      dispatch(setCredentials({ user: updatedUser, accessToken }));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await axios.put(
        apiUrl('/users/update-password'),
        { currentPassword: data.currentPassword, newPassword: data.newPassword },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      toast.success('Password updated! Please sign in again.');
      setShowPasswordDialog(false);
      resetPassword();
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update password');
    }
  };

  if (isLoading && !user) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  const orders = ordersData?.data?.orders || [];
  const totalSpent = orders
    .filter((o) => o.paymentInfo?.status === 'paid')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-0">
          <div className="relative h-32 gradient-bg">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200')] bg-cover bg-center mix-blend-overlay opacity-40" />
          </div>
          <CardContent className="p-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-32 w-32 rounded-full ring-4 ring-background overflow-hidden bg-muted">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={avatarPreview || user.avatar?.url}
                      alt={user.name}
                    />
                    <AvatarFallback className="gradient-bg text-white text-3xl font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2 sm:pb-2">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
                  {user.role === 'admin' && (
                    <Badge variant="gradient" className="gradient-bg text-white border-0">
                      <Shield className="h-3 w-3 mr-1" /> Admin
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {user.email}
                </p>
                {user.lastLogin && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last login: {formatDate(user.lastLogin)}
                  </p>
                )}
              </div>

              {/* Avatar Upload Actions */}
              {avatarPreview && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 sm:pb-2"
                >
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={uploadAvatar}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelAvatarUpload}>
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="glass p-4 rounded-xl text-center">
                <Package className="h-5 w-5 mx-auto text-fuchsia-500 mb-1" />
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <Heart className="h-5 w-5 mx-auto text-pink-500 mb-1" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Wishlist</p>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <span className="text-xl">💰</span>
                <p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your personal details and shipping address
                    </p>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="gradient"
                        onClick={handleSubmit(onSubmitProfile)}
                        disabled={isSaving || !isDirty}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          className="pl-10"
                          disabled={!isEditing}
                          {...register('name')}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          disabled={!isEditing}
                          placeholder="+1 (555) 000-0000"
                          {...register('phone')}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-fuchsia-500" />
                      <h3 className="font-semibold">Shipping Address</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        disabled={!isEditing}
                        placeholder="123 Main St, Apt 4B"
                        {...register('street')}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          disabled={!isEditing}
                          placeholder="New York"
                          {...register('city')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          disabled={!isEditing}
                          placeholder="NY"
                          {...register('state')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          disabled={!isEditing}
                          placeholder="10001"
                          {...register('zipCode')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          disabled={!isEditing}
                          placeholder="USA"
                          {...register('country')}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your password and account security
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Change Password */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Last updated:{' '}
                          {user.passwordChangedAt
                            ? formatDate(user.passwordChangedAt)
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <Dialog
                      open={showPasswordDialog}
                      onOpenChange={setShowPasswordDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">Change Password</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change your password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new secure one.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleSubmitPassword(onSubmitPassword)}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              {...registerPassword('currentPassword')}
                            />
                            {passwordErrors.currentPassword && (
                              <p className="text-sm text-destructive">
                                {passwordErrors.currentPassword.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              {...registerPassword('newPassword')}
                            />
                            {passwordErrors.newPassword && (
                              <p className="text-sm text-destructive">
                                {passwordErrors.newPassword.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm new password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              {...registerPassword('confirmPassword')}
                            />
                            {passwordErrors.confirmPassword && (
                              <p className="text-sm text-destructive">
                                {passwordErrors.confirmPassword.message}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              className="flex-1"
                              onClick={() => {
                                setShowPasswordDialog(false);
                                resetPassword();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" variant="gradient" className="flex-1">
                              Update Password
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Account Info */}
                  <div className="p-4 glass rounded-xl space-y-3">
                    <h3 className="font-semibold">Account Information</h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Type</p>
                        <p className="font-medium capitalize">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium flex items-center gap-1">
                          <span
                            className={`h-2 w-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`}
                          />
                          {user.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
