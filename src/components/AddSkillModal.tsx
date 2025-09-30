// FILE: src/components/AddSkillModal.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SKILL_CATEGORIES = [
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'AI/ML',
  'DevOps',
  'Cloud',
  'Mobile',
  'Security',
  'Design',
  'Game Dev',
  'Blockchain'
];

export const AddSkillModal = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!skillName || !category) {
      toast({
        title: "Missing Information",
        description: "Please provide both a skill name and a category.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const success = await onSave({ name: skillName, category });
    if (success) {
      toast({ title: "Skill Added!", description: `${skillName} has been added to your portfolio.` });
      onClose(); // Close the modal on success
    } else {
      toast({ title: "Error", description: "Could not add the skill.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Reset state when the modal is closed
  const handleClose = () => {
    if (!loading) {
      setSkillName('');
      setCategory('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Skill</DialogTitle>
          <DialogDescription>
            Add a new skill to your portfolio. It will start with a low mastery score that you can build up.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skill-name" className="text-right">Skill Name</Label>
            <Input
              id="skill-name"
              placeholder="e.g., Python"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !skillName || !category}>
            {loading ? 'Adding...' : 'Add Skill'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};