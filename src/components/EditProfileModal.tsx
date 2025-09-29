// FILE: src/components/EditProfileModal.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EditProfileModal = ({ isOpen, onClose, profile, preferences, goal, onSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // State for all editable fields
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [careerFocus, setCareerFocus] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [interests, setInterests] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');

  // Effect to populate state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(profile?.full_name || '');
      setAvatarUrl(profile?.avatar_url || '');
      setCareerFocus(preferences?.career_focus || 'full-stack-development');
      setPrimaryGoal(goal?.title || '');
      setInterests((preferences?.interests || []).join(', '));
      setSkillsToLearn((preferences?.skills_to_learn || []).join(', '));
    }
  }, [isOpen, profile, preferences, goal]);

  const handleSave = async () => {
    setLoading(true);
    const updates = {
      fullName,
      avatarUrl,
      careerFocus,
      primaryGoal,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean), // Convert comma-separated string to array
      skillsToLearn: skillsToLearn.split(',').map(s => s.trim()).filter(Boolean), // Convert comma-separated string to array
    };
    const success = await onSave(updates);
    if (success) {
      toast({ title: "Profile Updated!", description: "Your changes have been saved." });
      onClose();
    } else {
      toast({ title: "Error", description: "Could not update your profile.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth`, // Redirect user back to auth page after reset
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check Your Email", description: "A password reset link has been sent to you." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Name & Avatar */}
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          
          {/* Goal & Career Focus */}
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

          {/* Interests & Skills to Learn */}
          <Label htmlFor="interests">Interests</Label>
          <Input id="interests" placeholder="e.g., AI, Web3, Game Dev" value={interests} onChange={(e) => setInterests(e.target.value)} />
          <p className="text-xs text-muted-foreground -mt-3">Separate interests with a comma.</p>
          
          <Label htmlFor="skills-learn">Skills to Learn</Label>
          <Input id="skills-learn" placeholder="e.g., Rust, Kubernetes, Swift" value={skillsToLearn} onChange={(e) => setSkillsToLearn(e.target.value)} />
          <p className="text-xs text-muted-foreground -mt-3">Separate skills with a comma.</p>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={handlePasswordReset}>Send Password Reset</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};