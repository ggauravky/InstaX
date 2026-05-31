interface Task{
    id: number;
    title: string;
    completed: boolean;
}

interface CreateTaskRequest{
    title: string;
}

let tasks: Task[] = [
    { id: 1, title: 'Task 1', completed: false },
    { id: 2, title: 'Task 2', completed: true },
    { id: 3, title: 'Task 3', completed: false },
];

export async function GET() {
    return Response.json(tasks);
}

export async function POST(request: Request) {
    try{
        const body: CreateTaskRequest = await request.json();

        if(!body.title){
            return Response.json({ error: 'Title is required' }, { status: 400 });
        }

        tasks.push({
            id: tasks.length + 1,
            title: body.title,
            completed: false,
        });
        return Response.json({ message: 'Task created successfully' }, { status: 201 });
    } catch(error){
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}