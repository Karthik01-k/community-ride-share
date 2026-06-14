
-- 1. PROFILES: hide phone from other users via column grants
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (id, name, gender, govt_id_verified, rating, total_rides_as_driver, total_rides_as_passenger, total_co2_saved_kg, created_at, updated_at) ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_phone()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_phone() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_phone() TO authenticated;

-- 2. BOOKINGS: passenger can only cancel; driver can update freely
DROP POLICY IF EXISTS "Passengers and drivers can update bookings" ON public.bookings;

CREATE POLICY "Passengers can cancel own bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = passenger_id)
  WITH CHECK (auth.uid() = passenger_id AND status = 'cancelled');

CREATE POLICY "Drivers can update bookings on their trips" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = (SELECT driver_id FROM public.trips WHERE id = trip_id))
  WITH CHECK (auth.uid() = (SELECT driver_id FROM public.trips WHERE id = trip_id));

-- 3. RATINGS: only trip participants can insert
DROP POLICY IF EXISTS "Users can create ratings" ON public.ratings;
CREATE POLICY "Trip participants can create ratings" ON public.ratings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = rater_id
    AND (
      auth.uid() = (SELECT driver_id FROM public.trips WHERE id = trip_id)
      OR EXISTS (
        SELECT 1 FROM public.bookings
        WHERE bookings.trip_id = ratings.trip_id
          AND bookings.passenger_id = auth.uid()
          AND bookings.status = 'confirmed'
      )
    )
  );

-- 4. Restrict SECURITY DEFINER trigger helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 5. Remove anonymous SELECT on all data tables (GraphQL exposure)
REVOKE SELECT ON public.bookings, public.trips, public.vehicles, public.ratings FROM anon;
