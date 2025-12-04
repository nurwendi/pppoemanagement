import { z } from "zod";

export const formSchema = z.object({
  slotPort: z.string(),
  serialNumber: z.string(),
  onuId: z.string(),
  customerOnuName: z.string(),
  pppoeUsername: z.string(),
  pppoePassword: z.string(),
  vlanId: z.string(),
  profile: z.string(),
  cvlanProfile: z.string(),
});