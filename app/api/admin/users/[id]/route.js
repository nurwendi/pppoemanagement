import { NextResponse } from 'next/server';
import { updateUser, deleteUser } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedUser = await updateUser(id, body);
        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await deleteUser(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
