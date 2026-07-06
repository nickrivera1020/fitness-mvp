-- Seed: "Nutrition Basics" track — 5 education + 3 challenge modules.
-- PLACEHOLDER CONTENT: Nick will replace the copy. Structure is final.
-- Re-runnable: deletes and recreates the track (cascades to modules,
-- content, and any user progress on them — fine before launch).

delete from public.tracks where slug = 'nutrition-basics';

do $seed$
declare
  v_track uuid;
  v_mod uuid;
begin
  insert into public.tracks (slug, title, description, order_index, is_published)
  values (
    'nutrition-basics',
    'Nutrition Basics',
    'What food actually does, and how to eat with intention — no fads, no guilt.',
    0,
    true
  )
  returning id into v_track;

  -- ============================================================
  -- 1. Education: What is a calorie?
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'education', 'What is a calorie?', 'The unit behind every food label.', 0)
  returning id into v_mod;

  insert into public.education_content (module_id, body) values (v_mod, $$
A calorie is a **unit of energy** — nothing more mysterious than that. The same way miles measure distance, calories measure how much energy a food gives your body.

Your body spends that energy constantly. Most of it — usually **60–70%** — goes to just keeping you alive: heartbeat, breathing, body temperature, brain function. Movement and exercise come on top of that, and even digesting food burns a little.

One quirk worth knowing: what food labels call a "calorie" is technically a *kilocalorie* (1,000 small calories). Every label, app, and lesson here uses the food meaning, so you never need to convert anything.

The takeaway: calories aren't good or bad. They're just the currency your body runs on — and the rest of this track is about spending it deliberately.
$$);

  insert into public.quiz_questions (module_id, prompt, choices, correct_index, explanation, order_index) values
  (v_mod, 'A calorie is best described as…',
   '["A measure of how fattening a food is", "A unit of energy", "An additive put into processed food", "A measure of sugar content"]'::jsonb,
   1, 'Calories simply measure energy — how much fuel a food provides. Any food can fit into a healthy diet once you know its energy cost.', 0),
  (v_mod, 'Where does MOST of the energy you burn each day actually go?',
   '["Exercise and workouts", "Walking around", "Basic functions like heartbeat, breathing, and temperature", "Digesting food"]'::jsonb,
   2, 'Your resting metabolism — just staying alive — burns the majority of your daily calories. Exercise matters, but it is the smaller slice.', 1);

  -- ============================================================
  -- 2. Education: Calories in, calories out
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'education', 'Calories in, calories out', 'The energy balance that drives weight change.', 1)
  returning id into v_mod;

  insert into public.education_content (module_id, body, caveat) values (v_mod, $$
Weight change comes down to **energy balance**: calories you take in versus calories you burn.

- Eat about as much as you burn → weight stays steady
- Eat more than you burn (a **surplus**) → your body stores the extra, mostly as fat
- Eat less than you burn (a **deficit**) → your body draws on stored energy, and weight goes down

A common rule of thumb says one pound of body fat stores roughly **3,500 calories**. By that math, eating ~500 fewer calories per day would add up to about a pound lost per week.

The useful part isn't the exact number — it's the direction. Small, consistent daily differences compound into real change over weeks, in either direction. That's why the habits in this track focus on awareness first: you can't steer a number you never look at.
$$,
  $$The 3,500-calorie figure is a rough estimate, not a guarantee. Real-world results vary with metabolism, activity, sleep, and body composition — treat it as a compass, not a contract.$$);

  insert into public.quiz_questions (module_id, prompt, choices, correct_index, explanation, order_index) values
  (v_mod, 'Weight gain generally happens when…',
   '["You eat carbs after 8pm", "You take in more energy than you burn, consistently", "You eat any processed food", "You skip breakfast"]'::jsonb,
   1, 'Timing and food type matter far less than the overall balance. A consistent surplus — from any food — is what the body stores.', 0),
  (v_mod, 'One pound of body fat stores roughly how many calories?',
   '["350", "3,500", "35,000", "500"]'::jsonb,
   1, 'About 3,500 — but remember, that is an estimate for direction-setting, not an exact exchange rate. Bodies are messier than math.', 1);

  -- ============================================================
  -- 3. Education: Reading a nutrition label
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'education', 'Reading a nutrition label', 'Decode any package in 30 seconds.', 2)
  returning id into v_mod;

  insert into public.education_content (module_id, body) values (v_mod, $$
Nutrition labels look dense, but you only need a 3-step scan:

**1. Serving size — always first.** Every other number on the label describes *one serving*, and packages often contain several. A "200-calorie" bottle with 2.5 servings is really a 500-calorie bottle if you drink it all.

**2. Calories per serving.** Multiply by how many servings you'll actually have. Be honest — the label doesn't judge, and neither do we.

**3. Protein.** For now, it's the one macronutrient worth glancing at every time. (You'll learn why in an upcoming lesson.)

Bonus decoder: the **ingredients list is sorted by weight** — whatever there's most of comes first. If sugar (or one of its aliases) leads the list, that tells you more than any marketing on the front of the box.
$$);

  insert into public.quiz_questions (module_id, prompt, choices, correct_index, explanation, order_index) values
  (v_mod, 'What should you check FIRST on a nutrition label?',
   '["Calories", "Sugar", "Serving size", "Sodium"]'::jsonb,
   2, 'Serving size is the key that unlocks every other number. All the label''s values describe one serving — and packages often hold more than one.', 0),
  (v_mod, 'Ingredients on a label are listed…',
   '["Alphabetically", "By weight, heaviest first", "Randomly", "By how processed they are"]'::jsonb,
   1, 'Heaviest first. The first three ingredients tell you what the food mostly is.', 1);

  -- ============================================================
  -- 4. Challenge: Label detective (1 day)
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'challenge', 'Label detective', 'Put the 30-second scan to work on real food.', 3)
  returning id into v_mod;

  insert into public.challenges (module_id, instructions, metric_label, target_days) values (v_mod, $$
Today, pick **three foods you actually eat** — from your kitchen, a store, or a restaurant menu online — and run the 3-step scan on each:

1. What's the serving size, and how many servings would you really have?
2. How many calories is *your* actual portion?
3. How much protein does it have?

No writing anything down, no changing what you eat. This is purely about making the invisible visible. When you've scanned all three, check it off below.
$$,
  'I scanned 3 nutrition labels', 1);

  -- ============================================================
  -- 5. Education: Protein 101
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'education', 'Protein 101', 'The nutrient that keeps muscle on you.', 4)
  returning id into v_mod;

  insert into public.education_content (module_id, body, caveat) values (v_mod, $$
Protein is the raw material your body uses to build and repair — muscle, skin, enzymes, even hair. When you eat too little of it while losing weight, the weight you lose includes more **muscle**, which is exactly what you want to keep.

Protein also punches above its weight in two ways:

- **It's filling.** Meals with protein keep you satisfied longer than the same calories from carbs or fat alone.
- **It's expensive to digest.** Your body burns more energy processing protein than any other nutrient.

A practical starting target for most people is roughly **0.7–1 gram per pound of your goal body weight** per day. For someone aiming at 150 lbs, that's about 105–150g — think chicken, fish, eggs, Greek yogurt, beans, lentils, tofu, or a scoop of protein powder.

You don't need to hit it perfectly. You just need to stop landing at 40g by accident.
$$,
  $$Protein targets are general guidance for healthy adults, not a prescription. Individual needs vary — especially with kidney conditions or during pregnancy, where a doctor's advice comes first.$$);

  insert into public.quiz_questions (module_id, prompt, choices, correct_index, explanation, order_index) values
  (v_mod, 'Eating enough protein while losing weight mainly helps you…',
   '["Lose weight faster no matter what you eat", "Keep the muscle you have", "Avoid all hunger completely", "Skip strength training"]'::jsonb,
   1, 'A calorie deficit decides *that* you lose weight; protein (plus strength work) helps decide *what* you lose — fat instead of muscle.', 0),
  (v_mod, 'Which of these is the most protein-dense choice?',
   '["A plain bagel with cream cheese", "Grilled chicken breast", "A banana", "Buttered pasta"]'::jsonb,
   1, 'Chicken breast is mostly protein. The others are mostly carbs or fat — fine foods, just not protein sources.', 1);

  -- ============================================================
  -- 6. Challenge: Hit 100g of protein today (1 day)
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'challenge', 'Hit 100g of protein today', 'One day of eating like muscle matters.', 5)
  returning id into v_mod;

  insert into public.challenges (module_id, instructions, metric_label, target_days) values (v_mod, $$
Your mission for today: get **100 grams of protein** before the day ends.

A rough cheat sheet — each of these is ~25–30g:

- A palm-sized chicken breast or salmon fillet
- A cup of Greek yogurt plus a handful of almonds
- 4 eggs
- A scoop of protein powder in milk
- A cup and a half of cooked lentils

Stack any four and you're there. Use a label or a quick search when you're unsure — yesterday's label skills apply. When you've hit 100g (or made your honest best run at it), check in below.
$$,
  'I hit 100g of protein', 1);

  -- ============================================================
  -- 7. Education: Carbs and fats — fuel, not foes
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'education', 'Carbs and fats: fuel, not foes', 'Neither one is the villain. Here''s what they''re for.', 6)
  returning id into v_mod;

  insert into public.education_content (module_id, body) values (v_mod, $$
Every few years a new villain gets blamed for weight gain — fat in the 90s, carbs today. The evidence says something more boring and more useful: **total calories drive weight change; carbs and fats are just different fuels.**

**Carbohydrates** are your body's preferred quick energy — they power your brain and your workouts. Whole-food carbs (oats, rice, potatoes, fruit) also bring fiber, which slows digestion and keeps you full. The issue with sugary, refined carbs isn't dark magic; it's that they pack lots of calories into small, easy-to-overeat packages.

**Fats** are essential — literally. Your body needs them to make hormones and absorb certain vitamins. Olive oil, nuts, avocado, and fish are strong choices. Fat's only catch is density: at 9 calories per gram (vs. 4 for carbs and protein), portions matter more.

The skill isn't cutting either one. It's noticing *which versions* of each you're eating, and how much.
$$);

  insert into public.quiz_questions (module_id, prompt, choices, correct_index, explanation, order_index) values
  (v_mod, 'Which statement is TRUE?',
   '["Carbs after dark turn to fat", "Eating fat makes you fat", "Total calories matter more than whether they come from carbs or fat", "Fruit has too much sugar to be healthy"]'::jsonb,
   2, 'For weight change, overall energy balance is the driver. Food *quality* still matters for health and hunger — but no macronutrient is inherently fattening.', 0),
  (v_mod, 'Why do portions of fatty foods deserve extra attention?',
   '["Fat is toxic in large amounts", "Fat has more than twice the calories per gram of carbs or protein", "Fat cannot be burned as fuel", "They don''t — fat is unlimited"]'::jsonb,
   1, 'At 9 calories per gram, fat is the most energy-dense nutrient. A tablespoon of oil ~120 calories — great fuel, easy to overpour.', 1);

  -- ============================================================
  -- 8. Challenge: Log everything for 3 days
  -- ============================================================
  insert into public.modules (track_id, type, title, summary, order_index)
  values (v_track, 'challenge', 'Log everything for 3 days', 'The awareness habit everything else builds on.', 7)
  returning id into v_mod;

  insert into public.challenges (module_id, instructions, metric_label, target_days) values (v_mod, $$
For the next **three days in a row**, write down everything you eat and drink. Every meal, every snack, every splash of oil, every drink that isn't water.

- **Tool:** any calorie-tracking app, or plain notes on your phone. The app is easier — it adds up calories and protein for you.
- **Standard:** honest, not perfect. A rough guess logged beats a perfect entry skipped.
- **Rule:** no changing how you eat yet. This is reconnaissance, not a diet. You're just finding out what your normal actually looks like.

Check in below each day you complete a full day of logging. Miss a day and the streak restarts — three days *in a row* is the challenge.
$$,
  'I logged everything today', 3);

end
$seed$;
