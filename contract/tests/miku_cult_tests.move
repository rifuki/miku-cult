#[test_only]
module 0x0::miku_cult_tests;

use std::string::utf8;
use sui::{test_scenario, clock};
use 0x0::miku_cult::{Self, init_for_testing, CultShrine, CultFounderCap, DevotionAmulet, CultRegistry};

const ADMIN: address = @0xDEAD;
const USER_1: address = @0xFACE;
const USER_2: address = @0xBEEF;

const ETestFounderCapMismatch: u64 = 100;
const ETestAmuletMismatch: u64 = 101;
const ETestFaithMismatch: u64 = 102;
const ETestMemberCountMismatch: u64 = 104;
const ETestInitialFaith: u64 = 105;
const ETestInitialRank: u64 = 106;
const ETestFaithAfterChant: u64 = 107;
const ETestRankAfterUpgrade: u64 = 108;
const ETestFaithAfterRankUp: u64 = 109;

#[test]
fun test_create_cult_success() {
    let mut scenario = test_scenario::begin(ADMIN);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut registry = scenario.take_shared<CultRegistry>();
        miku_cult::create_cult(
            &mut registry, 
            utf8(b"The First Order"), 
            utf8(b"https://example.com/image.png"), 
            scenario.ctx()
        );
        test_scenario::return_shared(registry);
    };
    scenario.next_tx(USER_1);
    {
        let cult = scenario.take_shared<CultShrine>();
        let founder_cap = scenario.take_from_sender<CultFounderCap>();
        let amulet = scenario.take_from_sender<DevotionAmulet>();
        
        assert!(founder_cap.get_founder_cap_shrine_id() == cult.get_shrine_id(), ETestFounderCapMismatch);
        assert!(amulet.get_amulet_shrine_id() == cult.get_shrine_id(), ETestAmuletMismatch);
        assert!(amulet.get_amulet_faith() == 0, ETestInitialFaith);
        assert!(amulet.get_amulet_rank() == 1, ETestInitialRank);
        assert!(cult.get_shrine_member_count() == 1, ETestMemberCountMismatch);
        
        test_scenario::return_shared(cult);
        test_scenario::return_to_sender(&scenario, founder_cap);
        test_scenario::return_to_sender(&scenario, amulet);
    };
    scenario.end();
}

#[test]
fun test_join_cult() {
    let mut scenario = test_scenario::begin(ADMIN);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut registry = scenario.take_shared<CultRegistry>();
        miku_cult::create_cult(
            &mut registry, 
            utf8(b"The First Order"), 
            utf8(b"https://example.com/image.png"), 
            scenario.ctx()
        );
        test_scenario::return_shared(registry);
    };
    scenario.next_tx(USER_2);
    {
        let mut cult = scenario.take_shared<CultShrine>();
        cult.join_cult(scenario.ctx());
        assert!(cult.get_shrine_member_count() == 2, ETestMemberCountMismatch);
        test_scenario::return_shared(cult);
    };
    scenario.next_tx(USER_2);
    {
        let amulet = scenario.take_from_sender<DevotionAmulet>();
        assert!(amulet.get_amulet_faith() == 0, ETestInitialFaith);
        assert!(amulet.get_amulet_rank() == 1, ETestInitialRank);
        test_scenario::return_to_sender(&scenario, amulet);
    };
    scenario.end();
}

#[test]
fun test_daily_chant() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(scenario.ctx());
    // Set initial timestamp to 1 day so first chant works
    clock.set_for_testing(86_400_000);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut registry = scenario.take_shared<CultRegistry>();
        miku_cult::create_cult(
            &mut registry, 
            utf8(b"The First Order"), 
            utf8(b"https://example.com/image.png"), 
            scenario.ctx()
        );
        test_scenario::return_shared(registry);
    };
    scenario.next_tx(USER_1);
    {
        let mut amulet = scenario.take_from_sender<DevotionAmulet>();
        let mut shrine = scenario.take_shared<CultShrine>();
        
        amulet.daily_chant(&mut shrine, &clock);
        assert!(amulet.get_amulet_faith() == 10, ETestFaithAfterChant);
        
        test_scenario::return_to_sender(&scenario, amulet);
        test_scenario::return_shared(shrine);
    };
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
fun test_rank_up() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(scenario.ctx());
    // Set initial timestamp to 1 day so first chant works
    clock.set_for_testing(86_400_000);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut registry = scenario.take_shared<CultRegistry>();
        miku_cult::create_cult(
            &mut registry, 
            utf8(b"The First Order"), 
            utf8(b"https://example.com/image.png"), 
            scenario.ctx()
        );
        test_scenario::return_shared(registry);
    };
    scenario.next_tx(USER_1);
    {
        let mut amulet = scenario.take_from_sender<DevotionAmulet>();
        let mut shrine = scenario.take_shared<CultShrine>();
        
        // Chant 5 times to get 50 faith points
        // Need to advance clock between chants to avoid cooldown
        amulet.daily_chant(&mut shrine, &clock);
        clock.increment_for_testing(86_400_000); // 24 hours
        
        amulet.daily_chant(&mut shrine, &clock);
        clock.increment_for_testing(86_400_000);
        
        amulet.daily_chant(&mut shrine, &clock);
        clock.increment_for_testing(86_400_000);
        
        amulet.daily_chant(&mut shrine, &clock);
        clock.increment_for_testing(86_400_000);
        
        amulet.daily_chant(&mut shrine, &clock);
        
        assert!(amulet.get_amulet_faith() == 50, ETestFaithMismatch);
        
        amulet.rank_up();
        assert!(amulet.get_amulet_rank() == 2, ETestRankAfterUpgrade);
        assert!(amulet.get_amulet_faith() == 0, ETestFaithAfterRankUp); // Faith spent on rank up
        
        test_scenario::return_to_sender(&scenario, amulet);
        test_scenario::return_shared(shrine);
    };
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
fun test_chant_cooldown() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(scenario.ctx());
    // Set initial timestamp to 1 day so first chant works
    clock.set_for_testing(86_400_000);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut registry = scenario.take_shared<CultRegistry>();
        miku_cult::create_cult(
            &mut registry, 
            utf8(b"The First Order"), 
            utf8(b"https://example.com/image.png"), 
            scenario.ctx()
        );
        test_scenario::return_shared(registry);
    };
    scenario.next_tx(USER_1);
    {
        let mut amulet = scenario.take_from_sender<DevotionAmulet>();
        let mut shrine = scenario.take_shared<CultShrine>();
        
        // First chant should work
        amulet.daily_chant(&mut shrine, &clock);
        assert!(amulet.get_amulet_faith() == 10, ETestFaithAfterChant);
        
        test_scenario::return_to_sender(&scenario, amulet);
        test_scenario::return_shared(shrine);
    };
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 0x0::miku_cult::EChantOnCooldown)]
fun test_chant_cooldown_failure() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(scenario.ctx());
    // Set initial timestamp to 1 day so first chant works
    clock.set_for_testing(86_400_000);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut registry = scenario.take_shared<CultRegistry>();
        miku_cult::create_cult(
            &mut registry, 
            utf8(b"The First Order"), 
            utf8(b"https://example.com/image.png"), 
            scenario.ctx()
        );
        test_scenario::return_shared(registry);
    };
    scenario.next_tx(USER_1);
    {
        let mut amulet = scenario.take_from_sender<DevotionAmulet>();
        let mut shrine = scenario.take_shared<CultShrine>();
        
        // First chant should work
        amulet.daily_chant(&mut shrine, &clock);
        
        // Second chant without advancing clock should fail
        amulet.daily_chant(&mut shrine, &clock);
        
        test_scenario::return_to_sender(&scenario, amulet);
        test_scenario::return_shared(shrine);
    };
    clock.destroy_for_testing();
    scenario.end();
}
