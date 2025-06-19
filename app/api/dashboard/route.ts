import { firestore } from 'firebase-admin';
import { initFirebaseAdminSDK } from '@/config/firebase-admin-config';
import { NextRequest, NextResponse } from 'next/server';

initFirebaseAdminSDK();
const fsdb = firestore();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = fsdb.collection('dashboard_items');

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply search if provided
    if (search) {
      query = query.where('title', '>=', search)
                  .where('title', '<=', search + '\uf8ff');
    }

    // Apply pagination
    query = query.orderBy('date', 'desc')
                .limit(limit)
                .offset((page - 1) * limit);

    const snapshot = await query.get();
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString()
    }));

    // Get total count for pagination
    const totalSnapshot = await fsdb.collection('dashboard_items').count().get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
    const { title, description, status, assignedTo } = body;

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
      assignedTo,
      date: firestore.Timestamp.now()
    });

    return NextResponse.json({
      id: docRef.id,
      title,
      description,
      status,
      assignedTo,
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating dashboard item:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const docRef = fsdb.collection('dashboard_items').doc(id);
    await docRef.update({
      ...updateData,
      updatedAt: firestore.Timestamp.now()
    });

    return NextResponse.json({
      id,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating dashboard item:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await fsdb.collection('dashboard_items').doc(id).delete();

    return NextResponse.json({
      id,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dashboard item:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard item' },
      { status: 500 }
    );
  }
}