-- Create meals table
create table if not exists public.meals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    image_id uuid not null,
    created_at timestamptz default now() not null,
    nutrient_content jsonb not null,
    confirmed boolean default false not null,
    notes text
);

-- Set up RLS (Row Level Security)
alter table public.meals enable row level security;

-- Create policies
create policy "Users can view their own meals"
    on public.meals for select
    using (auth.uid() = user_id);

create policy "Users can insert their own meals"
    on public.meals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own meals"
    on public.meals for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own meals"
    on public.meals for delete
    using (auth.uid() = user_id);

-- Create indexes
create index meals_user_id_idx on public.meals(user_id);
create index meals_created_at_idx on public.meals(created_at);

-- Enable realtime
alter publication supabase_realtime add table public.meals; 