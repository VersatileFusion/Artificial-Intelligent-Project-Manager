const fetch = require('node-fetch');

async function testAI() {
  try {
    console.log('Logging in to get token...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error('Login failed:', loginData);
      return;
    }
    
    const token = loginData.token;
    const userId = loginData.user._id;
    console.log('Successfully logged in and got token');
    console.log('User ID:', userId);
    
    console.log('\nCreating test project...');
    const projectRes = await fetch('http://localhost:3000/api/projects', { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify({ 
        name: 'Test Project', 
        description: 'Project for testing AI features', 
        status: 'in-progress', 
        startDate: '2023-05-01', 
        endDate: '2023-08-01' 
      }) 
    });
    
    const projectResult = await projectRes.json();
    console.log('Created project:', projectResult);
    
    // Extract project ID from response
    const projectId = projectResult.data._id;
    if (!projectId) {
      console.error('Failed to create project with valid ID');
      return;
    }
    console.log('Project ID:', projectId);
    
    // Calculate a due date 10 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    console.log('\nCreating test task...');
    const taskRes = await fetch('http://localhost:3000/api/tasks', { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify({ 
        title: 'Test Task', 
        description: 'Task for testing AI prediction', 
        project: projectId, 
        status: 'todo', 
        priority: 'high',
        dueDate: dueDateStr,
        assignedTo: userId
      }) 
    });
    
    const taskResult = await taskRes.json();
    console.log('Created task:', taskResult);
    
    // Extract task ID from response
    const taskId = taskResult.data._id;
    if (!taskId) {
      console.error('Failed to create task with valid ID');
      return;
    }
    console.log('Task ID:', taskId);
    
    console.log('\nTesting task duration prediction (with heuristic fallback)...');
    const durationRes = await fetch(`http://localhost:3000/api/ai/tasks/duration/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const duration = await durationRes.json();
    console.log('Task duration prediction:', duration);
    
    console.log('\nTesting task suggestions (with heuristic fallback)...');
    const suggestionsRes = await fetch(`http://localhost:3000/api/ai/tasks/suggest/${projectId}?count=2`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const suggestions = await suggestionsRes.json();
    console.log('Task suggestions:', suggestions);
    
    console.log('\nTesting workflow optimization (with heuristic fallback)...');
    const workflowRes = await fetch(`http://localhost:3000/api/ai/projects/workflow/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const workflow = await workflowRes.json();
    console.log('Workflow optimization:', workflow);
    
    console.log('\nTesting project timeline prediction (with heuristic fallback)...');
    const timelineRes = await fetch(`http://localhost:3000/api/ai/projects/timeline/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const timeline = await timelineRes.json();
    console.log('Project timeline prediction:', timeline);
    
    console.log('\nAll AI fallback tests completed successfully!');
  } catch(error) {
    console.error('Error during testing:', error);
  }
}

testAI(); 