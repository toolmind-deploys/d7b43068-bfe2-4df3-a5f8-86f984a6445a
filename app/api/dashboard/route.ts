import { firestore } from 'firebase-admin';
import { initFirebaseAdminSDK } from '@/config/firebase-admin-config';
import { NextRequest, NextResponse } from 'next/server';

initFirebaseAdminSDK();
const fsdb = firestore();

export async function GET() {
  try {
    // Get users count
    const usersSnapshot = await fsdb.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Get projects statistics
    const projectsRef = fsdb.collection('projects');
    const projectsSnapshot = await projectsRef.get();
    const projects = projectsSnapshot.docs.map(doc => doc.data());
    const activeProjects = projects.filter(project => project.status === 'active').length;

    // Get tasks statistics
    const tasksRef = fsdb.collection('tasks');
    const tasksSnapshot = await tasksRef.get();
    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Get recent activity
    const activityRef = fsdb.collection('activity');
    const recentActivitySnapshot = await activityRef
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    const recentActivity = recentActivitySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        time: data.timestamp.toDate().toLocaleString(),
        type: data.type
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeProjects,
        totalTasks,
        completionRate
      },
      recentActivity
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
    const { type, title, description } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const activityRef = fsdb.collection('activity');
    const docRef = await activityRef.add({
      type,
      title,
      description,
      timestamp: firestore.Timestamp.now()
    });

    return NextResponse.json({
      id: docRef.id,
      type,
      title,
      description
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
