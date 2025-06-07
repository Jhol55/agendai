import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function GET() {
    const session = cookies().get("cw_d_session_info")?.value
    return NextResponse.json({ session });
}