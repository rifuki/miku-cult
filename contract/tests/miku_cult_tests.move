#[test_only]
module 0x0::miku_cult_tests;

use std::string::utf8;
use sui::test_scenario;
use 0x0::miku_cult::{Self, init_for_testing, CultShrine, CultFounderCap, DevotionAmulet};

const ADMIN: address = @0xDEAD;
const USER_1: address = @0xFACE;
const USER_2: address = @0xBEEF;

// Test Error Codes
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
        miku_cult::create_cult(utf8(b"The First Order"), scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let cult = scenario.take_shared<CultShrine>();
        let founder_cap = scenario.take_from_sender<CultFounderCap>();
        let amulet = scenario.take_from_sender<DevotionAmulet>();
        
        assert!(miku_cult::get_founder_cap_shrine_id(&founder_cap) == miku_cult::get_shrine_id(&cult), ETestFounderCapMismatch);
        assert!(miku_cult::get_amulet_shrine_id(&amulet) == miku_cult::get_shrine_id(&cult), ETestAmuletMismatch);
        assert!(miku_cult::get_amulet_faith(&amulet) == 0, ETestInitialFaith);
        assert!(miku_cult::get_amulet_rank(&amulet) == 1, ETestInitialRank);
        assert!(miku_cult::get_shrine_member_count(&cult) == 1, ETestMemberCountMismatch);
        
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
        miku_cult::create_cult(utf8(b"The First Order"), scenario.ctx());
    };
    scenario.next_tx(USER_2);
    {
        let mut cult = scenario.take_shared<CultShrine>();
        miku_cult::join_cult(&mut cult, scenario.ctx());
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
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        miku_cult::create_cult(utf8(b"The First Order"), scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut amulet = scenario.take_from_sender<DevotionAmulet>();
        miku_cult::daily_chant(&mut amulet);
        assert!(amulet.get_amulet_faith() == 10, ETestFaithAfterChant);
        test_scenario::return_to_sender(&scenario, amulet);
    };
    scenario.end();
}

#[test]
fun test_rank_up() {
    let mut scenario = test_scenario::begin(ADMIN);
    {
        init_for_testing(scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        miku_cult::create_cult(utf8(b"The First Order"), scenario.ctx());
    };
    scenario.next_tx(USER_1);
    {
        let mut amulet = scenario.take_from_sender<DevotionAmulet>();

        // Chant 5 times to get 50 faith points
        miku_cult::daily_chant(&mut amulet);
        miku_cult::daily_chant(&mut amulet);
        miku_cult::daily_chant(&mut amulet);
        miku_cult::daily_chant(&mut amulet);
        miku_cult::daily_chant(&mut amulet);
        
        assert!(amulet.get_amulet_faith() == 50, ETestFaithMismatch);
        
        miku_cult::rank_up(&mut amulet);
        assert!(amulet.get_amulet_rank() == 2, ETestRankAfterUpgrade);
        assert!(amulet.get_amulet_faith() == 0, ETestFaithAfterRankUp); // Faith spent on rank up
        
        test_scenario::return_to_sender(&scenario, amulet);
    };
    scenario.end();
}
