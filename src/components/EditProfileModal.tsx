// FILE: src/components/EditProfileModal.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const EditProfileModal = ({ isOpen, onClose, profile, preferences, goal, onSave, onPasswordSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // State for all editable fields
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [careerFocus, setCareerFocus] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [interests, setInterests] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Effect to populate state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(profile?.full_name || '');
      setAvatarUrl(profile?.avatar_url || '');
      setBio(profile?.bio || '');
      setCareerFocus(preferences?.career_focus || 'full-stack-development');
      setPrimaryGoal(goal?.title || '');
      setInterests((preferences?.interests || []).join(', '));
      setSkillsToLearn((preferences?.skills_to_learn || []).join(', '));
      // Always reset password fields when opening
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, profile, preferences, goal]);

  const handleSave = async () => {
    setLoading(true);

    // --- FIX: All save logic is now correctly inside this function ---

    // 1. Save Profile Details (excluding password)
    const profileUpdates = {
      fullName,
      avatarUrl,
      bio,
      careerFocus,
      primaryGoal,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      skillsToLearn: skillsToLearn.split(',').map(s => s.trim()).filter(Boolean),
    };
    const profileSaveSuccess = await onSave(profileUpdates);

    // 2. Save Password if a new one was entered
    let passwordSaveSuccess = true; // Assume success if no password was entered
    if (newPassword) {
      if (newPassword.length < 6) {
        toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
        setLoading(false);
        return; // Stop execution
      }
      if (newPassword !== confirmPassword) {
        toast({ title: "Passwords Do Not Match", variant: "destructive" });
        setLoading(false);
        return; // Stop execution
      }
      // Call the password save function passed from the parent
      passwordSaveSuccess = await onPasswordSave(newPassword);
    }
    
    setLoading(false);

    // 3. Show final feedback and close modal
    if (profileSaveSuccess && passwordSaveSuccess) {
      toast({ title: "Profile Updated!", description: "Your changes have been saved." });
      onClose();
    } else {
      toast({ title: "Error", description: "One or more updates failed. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          {/* --- This section remains the same --- */}
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          <Label htmlFor="bio">Bio / About Me</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Label htmlFor="goal">Primary Goal</Label>
          <Input id="goal" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} />
          <Label htmlFor="career">Career Focus</Label>
          <Select value={careerFocus} onValueChange={setCareerFocus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full-stack-development">Full-Stack Development</SelectItem>
              <SelectItem value="frontend-development">Frontend Development</SelectItem>
              <SelectItem value="backend-development">Backend Development</SelectItem>
              <SelectItem value="ai-ml-engineering">AI/ML Engineering</SelectItem>
              <SelectItem value="devops-engineering">DevOps Engineering</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="interests">Interests</Label>
          <Input id="interests" placeholder="e.g., AI, Web3, Game Dev" value={interests} onChange={(e) => setInterests(e.target.value)} />
          <p className="text-xs text-muted-foreground -mt-3">Separate interests with a comma.</p>
          <Label htmlFor="skills-learn">Skills to Learn</Label>
          <Input id="skills-learn" placeholder="e.g., Rust, Kubernetes, Swift" value={skillsToLearn} onChange={(e) => setSkillsToLearn(e.target.value)} />
          <p className="text-xs text-muted-foreground -mt-3">Separate skills with a comma.</p>

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