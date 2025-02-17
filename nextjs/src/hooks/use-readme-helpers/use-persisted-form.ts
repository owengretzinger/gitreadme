import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReadmeFormData, defaultFormValues, formSchema } from "./types";

export const usePersistedForm = () => {
  const queryClient = useQueryClient();
  const formKey = useMemo(() => ["readmeForm"] as const, []);

  const { data: persistedFormValues } = useQuery({
    queryKey: formKey,
    queryFn: () => defaultFormValues,
    enabled: false,
  });

  const form = useForm<ReadmeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: persistedFormValues ?? defaultFormValues,
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      queryClient.setQueryData(formKey, value);
    });
    return () => subscription.unsubscribe();
  }, [form, formKey, queryClient]);

  return form;
};
