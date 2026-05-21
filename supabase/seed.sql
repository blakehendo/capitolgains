insert into public.members (
  normalized_name,
  display_name,
  first_name,
  last_name,
  chamber,
  office,
  party,
  state,
  bioguide_id
)
values
  (
    'richard blumenthal',
    'Richard Blumenthal',
    'Richard',
    'Blumenthal',
    'senate',
    'Richard Blumenthal',
    'D',
    'CT',
    'B001277'
  ),
  (
    'ron wyden',
    'Ron Wyden',
    'Ron',
    'Wyden',
    'senate',
    'Ron Wyden',
    'D',
    'OR',
    'W000779'
  )
on conflict (normalized_name) do update
set
  display_name = excluded.display_name,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  chamber = excluded.chamber,
  office = excluded.office,
  party = excluded.party,
  state = excluded.state,
  bioguide_id = excluded.bioguide_id;
