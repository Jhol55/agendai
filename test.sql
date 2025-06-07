WITH RECURSIVE date_range AS (
  SELECT '{{ $fromAI('startDateTime') }}'::date AS date 
  UNION ALL
  SELECT (date + INTERVAL '1 day')::date
  FROM date_range
  WHERE date + INTERVAL '1 day' <= '{{ $fromAI('endDateTime') }}'::date 
),
booked_slots AS (
  SELECT 
    start_time AT TIME ZONE 'America/Sao_Paulo' AS start_time,  -- Convertendo para o fuso horário correto
    end_time AT TIME ZONE 'America/Sao_Paulo' AS end_time,  -- Convertendo para o fuso horário correto
    'available' AS availability
  FROM 
    appointments
  WHERE 
    start_time::date BETWEEN '{{ $fromAI('startDateTime') }}' AND '{{ $fromAI('endDateTime') }}' 
),
operating_hours_per_day AS (
  SELECT 
    dr.date,
    (dr.date + oh.start_time::time) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' AS open_time,  -- Convertendo para o fuso horário correto
    (dr.date + oh.end_time::time) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' AS close_time  -- Convertendo para o fuso horário correto
  FROM 
    date_range dr
  JOIN 
    operating_hours oh
  ON 
    EXTRACT(DOW FROM dr.date) = oh.day_of_week
  WHERE
    oh.closed = TRUE
),
all_possible_slots AS (
  SELECT 
    open_time + (generate_series(0, 
      EXTRACT(EPOCH FROM (close_time - open_time)) / 60 / 30) 
      * INTERVAL '30 minutes') AS start_time,
    open_time, close_time
  FROM 
    operating_hours_per_day
  WHERE 
    open_time > NOW()
),
available_slots AS (
  SELECT 
    aps.start_time, 
    aps.start_time + INTERVAL '{{ $('Check Appointment Availability Webhook').item.json.query.intervalMinutes }} minutes' AS end_time
  FROM 
    all_possible_slots aps
  LEFT JOIN 
    booked_slots bs
  ON 
    aps.start_time < bs.end_time AND 
    aps.start_time + INTERVAL '{{ $('Check Appointment Availability Webhook').item.json.query.intervalMinutes }} minutes' > bs.start_time
  WHERE 
    bs.start_time IS NULL AND 
    aps.start_time + INTERVAL '{{ $('Check Appointment Availability Webhook').item.json.query.intervalMinutes }} minutes' <= aps.close_time
)
SELECT 
  start_time, 
  end_time,
  'available' AS availability
FROM 
  available_slots
ORDER BY 
  start_time;