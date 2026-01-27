import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-mobile";
import { createMaterialAction } from "@/lib/actions/material/createMaterial";
import { updateMaterialAction } from "@/lib/actions/material/updateMaterial";
import {
  materialCreateSchema,
  materialCreateSchemaRequest,
  materialUnitOptions,
} from "@/lib/validators/material/MaterialValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface MaterialsDialogProps {
  trigger: React.ReactNode;
  initial?: Partial<materialCreateSchemaRequest>; // pass to edit
}

const MaterialsDialog: FC<MaterialsDialogProps> = ({ trigger, initial }) => {
  const router = useRouter();
  const isPhone = useMediaQuery("(max-width: 639px)"); // <640px => Drawer
  const [open, setOpen] = React.useState(false);
  const [isPending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(materialCreateSchema),
    defaultValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      gstRate: initial?.gstRate ?? 0,
      hsnCode: initial?.hsnCode ?? "",
      unit: initial?.unit ?? "PCS",
    },
  });

  async function onSubmit(values: materialCreateSchemaRequest) {
    setPending(true);
    setFormError(null);

    const res = values.id
      ? await updateMaterialAction(values)
      : await createMaterialAction(values);

    if (!res.ok) {
      setFormError(res.message as string);
      // Optional: map fieldErrors to RHF manually if you want per-field messages
      setPending(false);
      return;
    }

    toast.success(initial?.id ? "Material Updated" : "Material created");

    setPending(false);
    setOpen(false);

    router.refresh();

    form.reset(); // for create
  }

  const Title = initial?.id ? "Edit Material" : "Create Material";
  const Body = (
    <Form {...form}>
      <form
        id="material-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6">
        {formError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
            {formError}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Light Bulb - 40W" />
              </FormControl>
              <FormMessage className="text-rose-200" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {materialUnitOptions.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gstRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 18"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? 0 : Number(v));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hsnCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HSN Code (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 7601" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            form="material-form"
            type="submit"
            className="rounded-xl"
            data-modal-submit="true"
            disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isPhone) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>

        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{Title}</DrawerTitle>
          </DrawerHeader>

          {/* scrollable body */}
          <div className="overflow-y-auto px-4 pb-6">{Body}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // NON-PHONE => Dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="
            w-[calc(100vw-2rem)]
            sm:max-w-[760px]
            max-h-[85dvh]
            overflow-y-auto
          ">
        <DialogHeader className="pr-6">
          <DialogTitle>{Title}</DialogTitle>
        </DialogHeader>

        {Body}
      </DialogContent>
    </Dialog>
  );
};

export default MaterialsDialog;
