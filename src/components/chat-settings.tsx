import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Schema } from '@/schema'
import { useZero } from '@rocicorp/zero/react'
import { Ellipsis, TrashIcon } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Slider } from '@/components/ui/slider'

export function ChatSettings({ chatID }: { chatID: string }) {
  const z = useZero<Schema>()

  const deleteChat = () => {
    z.mutate.chat.delete({ id: chatID })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-2">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="width">Name</Label>
              <Input id="name" defaultValue="" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="width">System Prompt</Label>
              <Textarea id="width" defaultValue="" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="maxWidth">Temperature</Label>
              <div className="flex items-center gap-2">
                <Slider
                  defaultValue={[0.7]}
                  max={1}
                  step={0.01}
                  className="w-3/4"
                />
                <Input
                  id="temperature"
                  defaultValue="0.7"
                  className="w-1/4 h-8"
                />
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          className="w-full mt-8"
          onClick={deleteChat}
        >
          <TrashIcon className="w-5 h-5" />
          <span>Delete</span>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
