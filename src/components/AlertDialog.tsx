import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AlertProp {
  ButtonText: string;
}

export function AlertDialogDemo({ ButtonText }: AlertProp) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="standard" className="w-full">
          {ButtonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="mx-auto w-[90vw] max-w-[335px] rounded-2xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="body text-left">
            You can withdraw your deposited $SOL at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row items-center justify-end space-x-[10px]">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
