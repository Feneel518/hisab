import React, { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  shareChallanSchema,
  ShareChallanSchemaRequest,
  ShareMode,
} from "@/lib/validators/challan/sendChallanValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { shareChallanAction } from "@/lib/actions/challans/shareChallanAction";

interface ShareChallanProps {
  challanId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: ShareMode;
  phone: string | null;
  email: string | null;
}

const ShareChallan: FC<ShareChallanProps> = ({
  challanId,
  mode,
  onOpenChange,
  open,
  email,
  phone,
}) => {
  const form = useForm<ShareChallanSchemaRequest>({
    resolver: zodResolver(shareChallanSchema),
    defaultValues: {
      challanId,
      mode,
      phone: phone ?? "",
      email: email ?? "",
      message: "",
    },
  });

  React.useEffect(() => {
    form.setValue("challanId", challanId);
    form.setValue("mode", mode);
    form.setValue("email", "");
    // Optional: reset fields when changing mode
    form.clearErrors();
  }, [challanId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const isWhatsApp = mode === "WHATSAPP" || mode === "BOTH";
  const isEmail = mode === "EMAIL" || mode === "BOTH";

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: ShareChallanSchemaRequest) => {
    setIsSubmitting(true);

    console.log(values);

    try {
      const res = await shareChallanAction(values);

      if (!res.ok) {
        if (res.fieldErrors) {
          for (const [k, msgs] of Object.entries(res.fieldErrors)) {
            form.setError(k as any, { type: "server", message: msgs?.[0] });
          }
        }
        form.setError("root", { type: "server", message: res.message });
        return;
      }

      // Open WhatsApp if applicable
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      // Close modal
      onOpenChange(false);
      form.reset({
        challanId,
        mode,
        phone: "",
        email: "",
        message: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    mode === "WHATSAPP"
      ? "Send Challan on WhatsApp"
      : mode === "EMAIL"
      ? "Send Challan on Email"
      : "Send Challan on WhatsApp + Email";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* WhatsApp */}
            {isWhatsApp && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 919876543210 or 9876543210"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Leave blank to manually choose a contact in WhatsApp.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Email */}
            {isEmail && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="customer@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Optional message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a short note (we will append the challan link). Material Collected By?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </Form>

        {Object.keys(form.formState.errors).length > 0 && (
          <pre className="text-xs text-destructive whitespace-pre-wrap">
            {JSON.stringify(form.formState.errors, null, 2)}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareChallan;
