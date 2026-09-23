import { IsString,IsArray,ArrayMinSize,ValidateNested,} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentItemDto } from './payment-item.dto';

export class CreatePaymentSessionDto {

  @IsString()
  orderId: string;



  @IsString()
  currency: string;


  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];
}