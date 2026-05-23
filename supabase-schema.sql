-- Run this in your Supabase SQL editor

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'both' check (role in ('buyer', 'freelancer', 'both')),
  bio text,
  stripe_account_id text,
  stripe_onboarded boolean default false,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now()
);

-- Tasks
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  budget numeric(10,2) not null,
  deadline date,
  status text not null default 'open' check (status in ('open','in_progress','delivered','completed','disputed','cancelled')),
  freelancer_id uuid references public.profiles(id),
  stripe_payment_intent_id text,
  delivery_message text,
  delivery_file_url text,
  created_at timestamptz default now()
);

-- Applications
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  freelancer_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now(),
  unique(task_id, freelancer_id)
);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now(),
  unique(task_id, reviewer_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Public profiles viewable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Tasks policies
create policy "Tasks viewable by all" on public.tasks for select using (true);
create policy "Buyers create tasks" on public.tasks for insert with check (auth.uid() = buyer_id);
create policy "Buyers update own tasks" on public.tasks for update using (auth.uid() = buyer_id);
create policy "Freelancers update assigned tasks" on public.tasks for update using (auth.uid() = freelancer_id);

-- Applications policies
create policy "Applications viewable by task buyer and applicant" on public.applications
  for select using (
    auth.uid() = freelancer_id or
    auth.uid() in (select buyer_id from public.tasks where id = task_id)
  );
create policy "Freelancers create applications" on public.applications for insert with check (auth.uid() = freelancer_id);
create policy "Buyers update applications" on public.applications for update
  using (auth.uid() in (select buyer_id from public.tasks where id = task_id));

-- Messages policies
create policy "Messages viewable by task participants" on public.messages
  for select using (
    auth.uid() in (
      select buyer_id from public.tasks where id = task_id
      union
      select freelancer_id from public.tasks where id = task_id and freelancer_id is not null
    )
  );
create policy "Task participants can send messages" on public.messages for insert
  with check (
    auth.uid() = sender_id and
    auth.uid() in (
      select buyer_id from public.tasks where id = task_id
      union
      select freelancer_id from public.tasks where id = task_id and freelancer_id is not null
    )
  );

-- Reviews policies
create policy "Reviews viewable by all" on public.reviews for select using (true);
create policy "Task participants can leave reviews" on public.reviews for insert
  with check (
    auth.uid() = reviewer_id and
    auth.uid() in (
      select buyer_id from public.tasks where id = task_id
      union
      select freelancer_id from public.tasks where id = task_id
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update rating when review added
create or replace function public.update_rating()
returns trigger as $$
begin
  update public.profiles
  set
    rating = (select avg(rating) from public.reviews where reviewee_id = new.reviewee_id),
    review_count = (select count(*) from public.reviews where reviewee_id = new.reviewee_id)
  where id = new.reviewee_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_rating();
