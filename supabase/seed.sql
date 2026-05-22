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
    'gary peters',
    'Gary Peters',
    'Gary',
    'Peters',
    'senate',
    'Gary Peters',
    'D',
    'MI',
    'P000595'
  ),
  (
    'john fetterman',
    'John Fetterman',
    'John',
    'Fetterman',
    'senate',
    'John Fetterman',
    'D',
    'PA',
    'F000479'
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
