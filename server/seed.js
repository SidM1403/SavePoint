require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://admin:secret@localhost:5432/questlog'
});

// 15 well-known, highly-rated games with real IGDB IDs and cover URLs
const games = [
    { rawg_id: 11936, title: 'The Legend of Zelda: Breath of the Wild', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg', release_date: '2017-03-03', rawg_rating: 9.7, genres: ['Adventure', 'RPG'] },
    { rawg_id: 1942, title: 'The Witcher 3: Wild Hunt', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg', release_date: '2015-05-19', rawg_rating: 9.6, genres: ['RPG'] },
    { rawg_id: 1877, title: 'Cyberpunk 2077', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg', release_date: '2020-12-10', rawg_rating: 8.5, genres: ['RPG', 'Shooter'] },
    { rawg_id: 119133, title: 'Elden Ring', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg', release_date: '2022-02-25', rawg_rating: 9.8, genres: ['RPG', 'Adventure'] },
    { rawg_id: 17000, title: 'Stardew Valley', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.jpg', release_date: '2016-02-26', rawg_rating: 9.0, genres: ['Simulator', 'RPG'] },
    { rawg_id: 1020, title: 'Grand Theft Auto V', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ycj.jpg', release_date: '2013-09-17', rawg_rating: 9.5, genres: ['Adventure', 'Shooter'] },
    { rawg_id: 427, title: 'Portal 2', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rs4.jpg', release_date: '2011-04-19', rawg_rating: 9.4, genres: ['Puzzle', 'Shooter'] },
    { rawg_id: 7334, title: 'Hollow Knight', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg', release_date: '2017-02-24', rawg_rating: 9.1, genres: ['Platform', 'Adventure'] },
    { rawg_id: 114283, title: 'Hades', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2qmt.jpg', release_date: '2020-09-17', rawg_rating: 9.3, genres: ['Indie', 'RPG'] },
    { rawg_id: 26192, title: 'Bloodborne', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rba.jpg', release_date: '2015-03-24', rawg_rating: 9.2, genres: ['RPG', 'Adventure'] },
    { rawg_id: 732, title: 'Red Dead Redemption 2', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg', release_date: '2018-10-26', rawg_rating: 9.7, genres: ['Adventure', 'Shooter'] },
    { rawg_id: 11737, title: 'Dark Souls III', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcf.jpg', release_date: '2016-03-24', rawg_rating: 9.0, genres: ['RPG', 'Adventure'] },
    { rawg_id: 112875, title: 'God of War Ragnarök', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg', release_date: '2022-11-09', rawg_rating: 9.4, genres: ['Adventure', 'RPG'] },
    { rawg_id: 120, title: 'Celeste', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3byy.jpg', release_date: '2018-01-25', rawg_rating: 9.1, genres: ['Platform', 'Indie'] },
    { rawg_id: 121, title: 'Disco Elysium', cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1sfj.jpg', release_date: '2019-10-15', rawg_rating: 9.3, genres: ['RPG', 'Adventure'] },
];

// 10 realistic users with distinct gaming personalities
const users = [
    { username: 'ghostblade', email: 'ghost@savepoint.gg', password: 'password123' },
    { username: 'nyx_aurora', email: 'nyx@savepoint.gg', password: 'password123' },
    { username: 'pixel_ronin', email: 'ronin@savepoint.gg', password: 'password123' },
    { username: 'cosmicfawn', email: 'cosmic@savepoint.gg', password: 'password123' },
    { username: 'voidwalker88', email: 'void@savepoint.gg', password: 'password123' },
    { username: 'emberglow', email: 'ember@savepoint.gg', password: 'password123' },
    { username: 'starfall_sam', email: 'sam@savepoint.gg', password: 'password123' },
    { username: 'jade_circuit', email: 'jade@savepoint.gg', password: 'password123' },
    { username: 'driftwood_dev', email: 'drift@savepoint.gg', password: 'password123' },
    { username: 'halcyon_play', email: 'halcyon@savepoint.gg', password: 'password123' },
];

// Library entries: [userIndex, gameTitle, status, rating, review]
// Reviews are written to sound like real people with different tones and personalities
const libraryEntries = [
    // ghostblade — hardcore soulslike fan, terse and opinionated
    [0, 'Elden Ring', 'completed', 10, 'Probably the greatest open world game ever made. Every legacy dungeon felt hand-crafted. I lost a whole weekend to Caelid and I regret nothing.'],
    [0, 'Bloodborne', 'completed', 10, 'This game changed what I expect from combat in RPGs. The rally mechanic is genius. Central Yharnam still gives me chills.'],
    [0, 'Dark Souls III', 'completed', 9, 'The Ringed City DLC alone justifies the whole game. Nameless King took me about 40 tries. Worth every second.'],
    [0, 'Hollow Knight', 'completed', 8, 'Didn\'t expect a cute bug game to destroy me this hard. The Radiance fight is insane.'],
    [0, 'Celeste', 'playing', 7, 'Picked this up on a whim. The platforming is tight but I\'m mostly here for the difficulty.'],

    // nyx_aurora — story-driven gamer, loves narratives and world building
    [1, 'The Witcher 3: Wild Hunt', 'completed', 10, 'I genuinely teared up during the Blood and Wine ending. The writing in this game puts most fantasy novels to shame. Dandelion is underrated.'],
    [1, 'Red Dead Redemption 2', 'completed', 10, 'Arthur Morgan might be my favorite protagonist in any medium. The slow pacing works because every moment feels lived-in.'],
    [1, 'Disco Elysium', 'completed', 9, 'The Inland Empire skill is basically what my brain sounds like at 3am. Never seen a game treat failure this gracefully.'],
    [1, 'Cyberpunk 2077', 'completed', 8, 'Phantom Liberty fixed so many issues. Panam\'s questline and the ending where V calls everyone... yeah, I cried.'],
    [1, 'God of War Ragnarök', 'playing', null, null],

    // pixel_ronin — retro-loving indie gamer
    [2, 'Hollow Knight', 'completed', 10, 'This is the best $15 I\'ve ever spent on anything. 60+ hours and I STILL haven\'t beaten the Pantheon of Hallownest.'],
    [2, 'Celeste', 'completed', 10, 'Chapter 9 made me feel things I didn\'t know a platformer could. The assist mode is also a masterclass in accessibility.'],
    [2, 'Hades', 'completed', 9, 'Run 47 is when I finally escaped. The dialogue system is incredible — I kept dying on purpose just to hear more conversations.'],
    [2, 'Stardew Valley', 'completed', 9, 'Started a farm called "Pixelton" and accidentally played for 14 hours straight. Married Leah. No regrets.'],
    [2, 'Portal 2', 'completed', 8, 'Replayed this with my younger brother as co-op. The puzzle design is timeless. Cave Johnson is iconic.'],

    // cosmicfawn — casual gamer, wholesome vibes, plays for relaxation
    [3, 'Stardew Valley', 'completed', 10, 'This is my comfort game. I put it on when I\'m stressed and just water my crops. Pierre is still terrible though.'],
    [3, 'The Legend of Zelda: Breath of the Wild', 'completed', 9, 'Spent more time cooking and shield-surfing than actually fighting Ganon. And that\'s okay.'],
    [3, 'Hades', 'completed', 8, 'Not usually into roguelikes but Zagreus and Megaera\'s relationship kept me hooked. The art direction is gorgeous.'],
    [3, 'Red Dead Redemption 2', 'playing', null, null],
    [3, 'Celeste', 'want_to_play', null, null],

    // voidwalker88 — completionist, rates everything methodically
    [4, 'Elden Ring', 'completed', 9, 'Platinum\'d in 120 hours. Malenia took 73 attempts. The build variety is unmatched but some late-game bosses reuse too many assets.'],
    [4, 'The Witcher 3: Wild Hunt', 'completed', 9, 'Every question mark explored. Gwent is basically a separate game and it\'s better than most card games on Steam.'],
    [4, 'Red Dead Redemption 2', 'completed', 10, 'The compendium took forever but riding through the bayou at sunset made it worth it. 100% completion.'],
    [4, 'Grand Theft Auto V', 'completed', 8, 'Trevor carried the story. Online mode is a mess but the single-player campaign is genuinely well-written.'],
    [4, 'The Legend of Zelda: Breath of the Wild', 'completed', 9, 'All 120 shrines done. Korok seeds? Not a chance, I value my sanity.'],
    [4, 'God of War Ragnarök', 'completed', 9, 'The Berserker fights are the highlight. Kratos showing vulnerability is the character development we deserved.'],

    // emberglow — new to gaming, enthusiastic reviews
    [5, 'Hades', 'completed', 10, 'My first roguelike and now I\'m obsessed with the genre!! Dionysus boons are so fun. The soundtrack goes SO hard.'],
    [5, 'Stardew Valley', 'playing', 9, 'Just discovered you can put hats on your horse?? This game keeps on giving. Year 2 and still finding new stuff.'],
    [5, 'Portal 2', 'completed', 9, 'The way it teaches you puzzle mechanics without any tutorials is so clever. GLaDOS is hilarious.'],
    [5, 'The Legend of Zelda: Breath of the Wild', 'playing', null, null],
    [5, 'Hollow Knight', 'want_to_play', null, null],

    // starfall_sam — balanced taste, plays everything
    [6, 'Cyberpunk 2077', 'completed', 7, 'Post-2.0 update this is a solid 7. Keanu Reeves is great but some side quests feel filler. Night City looks unreal though.'],
    [6, 'Grand Theft Auto V', 'completed', 9, 'Michael\'s midlife crisis is weirdly relatable. The heist planning system deserved its own game.'],
    [6, 'Dark Souls III', 'completed', 8, 'First Souls game. Died to Iudex Gundyr probably 20 times. Now I can no-hit him. That\'s the magic.'],
    [6, 'Bloodborne', 'playing', null, null],
    [6, 'Disco Elysium', 'want_to_play', null, null],

    // jade_circuit — critical thinker, nuanced reviews
    [7, 'Disco Elysium', 'completed', 10, 'A murder mystery where solving the murder is the least interesting thing happening. The political compass system is brilliant satire.'],
    [7, 'Red Dead Redemption 2', 'completed', 8, 'Technically stunning but Rockstar\'s obsession with realism sometimes gets in the way of fun. Horse controls are rough.'],
    [7, 'Elden Ring', 'completed', 8, 'Incredible first 40 hours. The last third overstays its welcome a bit. Limgrave is peak level design though.'],
    [7, 'Celeste', 'completed', 9, 'Games rarely tackle mental health this honestly. The B-sides are brutal but rewarding. Strawberries are meaningless and I love that.'],
    [7, 'The Witcher 3: Wild Hunt', 'completed', 8, 'The Baron questline is peak RPG storytelling. Combat never quite clicked for me though.'],

    // driftwood_dev — game dev perspective, analytical
    [8, 'Hollow Knight', 'completed', 10, 'As a dev, the amount of content Team Cherry shipped for this price is mind-blowing. The animation system is incredibly polished.'],
    [8, 'Portal 2', 'completed', 10, 'Valve\'s level design philosophy in this game should be studied in schools. The pacing from tutorial to expert is flawless.'],
    [8, 'Hades', 'completed', 9, 'Supergiant nailed the narrative-roguelike loop. The way death is woven into the story is genius game design.'],
    [8, 'God of War Ragnarök', 'completed', 8, 'The production values are insane but the combat arenas feel a bit samey. Odin\'s characterization is fantastic though.'],
    [8, 'Cyberpunk 2077', 'dropped', 5, 'Played at launch on PS4. The performance issues were unacceptable. Might revisit on PC someday.'],

    // halcyon_play — laidback, short reviews, vibes-based
    [9, 'Stardew Valley', 'completed', 10, 'Literally perfect. I have 400 hours and I just started a new save yesterday.'],
    [9, 'The Legend of Zelda: Breath of the Wild', 'completed', 10, 'Standing on a cliff watching the sunset while my stamina runs out. Peak gaming.'],
    [9, 'Grand Theft Auto V', 'completed', 8, 'Franklin is the only sane person in this game and I respect him for it.'],
    [9, 'Hades', 'playing', null, null],
    [9, 'Elden Ring', 'want_to_play', null, null],
];

// Follow relationships: [followerIndex, followedIndex]
const follows = [
    [0, 1], [0, 2], [0, 4],           // ghostblade follows nyx, pixel_ronin, voidwalker
    [1, 0], [1, 3], [1, 7],           // nyx follows ghostblade, cosmicfawn, jade
    [2, 0], [2, 5], [2, 8],           // pixel_ronin follows ghostblade, emberglow, driftwood
    [3, 1], [3, 5], [3, 9],           // cosmicfawn follows nyx, emberglow, halcyon
    [4, 0], [4, 6], [4, 7],           // voidwalker follows ghostblade, starfall, jade
    [5, 2], [5, 3], [5, 9],           // emberglow follows pixel_ronin, cosmicfawn, halcyon
    [6, 0], [6, 4], [6, 8],           // starfall follows ghostblade, voidwalker, driftwood
    [7, 1], [7, 8], [7, 2],           // jade follows nyx, driftwood, pixel_ronin
    [8, 7], [8, 2], [8, 0],           // driftwood follows jade, pixel_ronin, ghostblade
    [9, 3], [9, 5], [9, 1],           // halcyon follows cosmicfawn, emberglow, nyx
];

// Lists: [userIndex, name, description, is_private]
const lists = [
    [0, 'Soulsborne Gauntlet', 'Every Souls-like I\'ve beaten, ranked by difficulty. Malenia sits at the top.', false],
    [0, 'Rainy Day Games', 'Games I play when the weather sucks and I need something cozy-adjacent.', false],
    [1, 'Games That Made Me Cry', 'No shame. These broke me emotionally and I\'m grateful.', false],
    [1, 'Storytelling Masterclass', 'Games with writing that rivals great literature.', false],
    [2, 'Under $20 Bangers', 'Proof that you don\'t need a AAA budget to make something incredible.', false],
    [3, 'Cozy Corner', 'For when the world is too much and you just need to tend a virtual garden.', false],
    [4, 'Platinum Trophy Shelf', 'Every game I\'ve 100% completed. Pain and pride in equal measure.', true],
    [5, 'My First Favorites', 'Games that got me into gaming. Forever grateful for these.', false],
    [7, 'Games as Art', 'Titles that push the medium forward. Not just entertainment — experiences.', false],
    [8, 'Dev Inspiration', 'Games I study for their design philosophy and polish.', true],
    [9, 'Vibes Only', 'No meta. No min-maxing. Just vibes.', false],
];

// List entries: [listIndex, gameTitle]
const listEntries = [
    // Soulsborne Gauntlet
    [0, 'Elden Ring'], [0, 'Bloodborne'], [0, 'Dark Souls III'], [0, 'Hollow Knight'],
    // Rainy Day Games
    [1, 'Stardew Valley'], [1, 'Celeste'],
    // Games That Made Me Cry
    [2, 'Red Dead Redemption 2'], [2, 'The Witcher 3: Wild Hunt'], [2, 'Cyberpunk 2077'],
    // Storytelling Masterclass
    [3, 'Disco Elysium'], [3, 'The Witcher 3: Wild Hunt'], [3, 'Red Dead Redemption 2'],
    // Under $20 Bangers
    [4, 'Hollow Knight'], [4, 'Celeste'], [4, 'Hades'], [4, 'Stardew Valley'],
    // Cozy Corner
    [5, 'Stardew Valley'], [5, 'The Legend of Zelda: Breath of the Wild'], [5, 'Celeste'],
    // Platinum Trophy Shelf
    [6, 'Elden Ring'], [6, 'The Witcher 3: Wild Hunt'], [6, 'Red Dead Redemption 2'], [6, 'Grand Theft Auto V'], [6, 'God of War Ragnarök'],
    // My First Favorites
    [7, 'Hades'], [7, 'Portal 2'], [7, 'Stardew Valley'],
    // Games as Art
    [8, 'Disco Elysium'], [8, 'Celeste'], [8, 'Hollow Knight'], [8, 'Red Dead Redemption 2'],
    // Dev Inspiration
    [9, 'Hollow Knight'], [9, 'Portal 2'], [9, 'Hades'], [9, 'God of War Ragnarök'],
    // Vibes Only
    [10, 'Stardew Valley'], [10, 'The Legend of Zelda: Breath of the Wild'], [10, 'Hades'],
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🗑️  Clearing all old data...');
        await client.query('DELETE FROM list_entries');
        await client.query('DELETE FROM lists');
        await client.query('DELETE FROM follows');
        await client.query('DELETE FROM user_games');
        await client.query('DELETE FROM games');
        await client.query('DELETE FROM users');
        console.log('   Old data cleared.\n');

        // --- Games ---
        console.log('🎮 Seeding games...');
        for (let g of games) {
            await client.query(
                `INSERT INTO games (rawg_id, title, cover_url, release_date, rawg_rating, genres)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (rawg_id) DO NOTHING`,
                [g.rawg_id, g.title, g.cover_url, g.release_date, g.rawg_rating, g.genres]
            );
        }
        console.log(`   ✓ ${games.length} games seeded.`);

        // --- Users ---
        console.log('👤 Seeding users...');
        for (let u of users) {
            const hash = await bcrypt.hash(u.password, 10);
            await client.query(
                `INSERT INTO users (username, email, password_hash)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (email) DO NOTHING`,
                [u.username, u.email, hash]
            );
        }
        console.log(`   ✓ ${users.length} users seeded.`);

        // Fetch DB IDs
        const dbUsers = (await client.query('SELECT id, username FROM users ORDER BY id')).rows;
        const dbGames = (await client.query('SELECT id, title FROM games')).rows;

        const findUser = (idx) => dbUsers.find(u => u.username === users[idx].username);
        const findGame = (title) => dbGames.find(g => g.title === title);

        // --- Library & Reviews ---
        console.log('📚 Seeding library entries & reviews...');
        let libCount = 0;
        for (let entry of libraryEntries) {
            const [userIdx, gameTitle, status, rating, review] = entry;
            const user = findUser(userIdx);
            const game = findGame(gameTitle);
            if (!user || !game) continue;

            await client.query(
                `INSERT INTO user_games (user_id, game_id, status, rating, review, added_at)
                 VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '1 day' * (RANDOM() * 60)::int)
                 ON CONFLICT (user_id, game_id) DO NOTHING`,
                [user.id, game.id, status, rating, review]
            );
            libCount++;
        }
        console.log(`   ✓ ${libCount} library entries seeded.`);

        // --- Follows ---
        console.log('🤝 Seeding follow relationships...');
        let followCount = 0;
        for (let [followerIdx, followedIdx] of follows) {
            const follower = findUser(followerIdx);
            const followed = findUser(followedIdx);
            if (!follower || !followed) continue;

            await client.query(
                `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [follower.id, followed.id]
            );
            followCount++;
        }
        console.log(`   ✓ ${followCount} follow relationships seeded.`);

        // --- Lists ---
        console.log('📋 Seeding custom lists...');
        const createdLists = [];
        for (let [userIdx, name, description, is_private] of lists) {
            const user = findUser(userIdx);
            if (!user) continue;

            const result = await client.query(
                `INSERT INTO lists (user_id, name, description, is_private)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [user.id, name, description, is_private]
            );
            createdLists.push(result.rows[0].id);
        }
        console.log(`   ✓ ${createdLists.length} lists seeded.`);

        // --- List Entries ---
        console.log('🎯 Seeding list entries...');
        let entryCount = 0;
        for (let [listIdx, gameTitle] of listEntries) {
            const listId = createdLists[listIdx];
            const game = findGame(gameTitle);
            if (!listId || !game) continue;

            await client.query(
                `INSERT INTO list_entries (list_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [listId, game.id]
            );
            entryCount++;
        }
        console.log(`   ✓ ${entryCount} list entries seeded.`);

        console.log('\n🎉 Seed complete! All features populated.');
        console.log('   Login with any user: password = "password123"');
        console.log('   Try: ghostblade, nyx_aurora, pixel_ronin, cosmicfawn, etc.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

seed();
