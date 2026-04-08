// No authentication middleware — open access
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}
