import { firestore } from 'firebase-admin';
import { initFirebaseAdminSDK } from '@/config/firebase-admin-config';
import { NextRequest, NextResponse } from 'next/server';

initFirebaseAdminSDK();
const fsdb = firestore();

export async function GET() {
  try {
    const dashboardRef = fsdb.collection('dashboard_items');
    const snapshot = await dashboardRef.get();
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const dashboardRef = fsdb.collection('dashboard_items');
    const docRef = await dashboardRef.add({
      title,
      description,
      status,
      createdAt: firestore.Timestamp.now()
    });

    return NextResponse.json({
      id: docRef.id,
      title,
      description,
      status
    });
  } catch (error) {
    console.error('Error creating dashboard item:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard item' },
      { status: 500 }
    );
  }
}