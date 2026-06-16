import { NextResponse } from 'next/server';
import { getActiveShippingServices } from '@/lib/data-access/shipping-services';

export async function GET() {
  const services = await getActiveShippingServices();
  return NextResponse.json(services);
}
