import { PartialType } from "@nestjs/mapped-types";
import { CreatePaymentDto } from "./create-Payment.dto";

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}