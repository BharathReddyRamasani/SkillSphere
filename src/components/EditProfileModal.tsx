// FILE: src/components/EditProfileModal.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const CAREER_FOCUS_OPTIONS = [
  "Full-Stack Development",
  "Frontend Development",
  "Backend Development",
  "AI/ML Engineering",
  "DevOps Engineering",
  "Mobile Development",
];

export const EditProfileModal = ({ isOpen, onClose, profile, preferences, goals, onSave, onPasswordSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [careerFocuses, setCareerFocuses] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFullName(profile?.full_name || '');
      setBio(profile?.bio || '');
      setCareerFocuses(preferences?.career_focuses || []);
      setCareerGoals((goals?.map(g => g.title) || []).join('\n'));
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, profile, preferences, goals]);

  const handleFocusChange = (focus: string) => {
    setCareerFocuses(prev => 
      prev.includes(focus) ? prev.filter(item => item !== focus) : [...prev, focus]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    let passwordSaveSuccess = true;

    // Handle password update first if filled
    if (newPassword) {
      if (newPassword.length < 6) {
        toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: "Passwords Do Not Match", variant: "destructive" });
        setLoading(false);
        return;
      }
      passwordSaveSuccess = await onPasswordSave(newPassword);
    }

    // Now, save other profile details
    const profileUpdates = {
      fullName,
      bio,
      careerFocuses,
      goals: careerGoals.split('\n').map(g => g.trim()).filter(Boolean),
    };
    const profileSaveSuccess = await onSave(profileUpdates);
    
    setLoading(false);

    if (profileSaveSuccess && passwordSaveSuccess) {
      toast({ title: "Profile Updated!", description: "Your changes have been saved." });
      onClose();
    } else if (!profileSaveSuccess) {
      toast({ title: "Error", description: "Could not update your profile details.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          
          <Label htmlFor="bio">Bio / About Me</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself." />
          
          <Label>Career Focus (select multiple)</Label>
          <div className="space-y-2 rounded-md border p-4">
            {CAREER_FOCUS_OPTIONS.map(focus => (
              <div key={focus} className="flex items-center space-x-2">
                <Checkbox
                  id={focus}
                  checked={careerFocuses.includes(focus)}
                  onCheckedChange={() => handleFocusChange(focus)}
                />
                <Label htmlFor={focus} className="font-normal cursor-pointer">{focus}</Label>
              </div>
            ))}
          </div>

          <Label htmlFor="goals">Career Goals</Label>
          <Textarea id="goals" placeholder="e.g., Become a Senior Frontend Developer" value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} />
          <p className="text-xs text-muted-foreground -mt-3">Enter one goal per line.</p>
          
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Change Password</h4>
            <p className="text-sm text-muted-foreground mb-2">Leave blank if you don't want to change your password.</p>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};