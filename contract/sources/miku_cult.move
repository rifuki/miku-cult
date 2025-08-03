module 0x0::miku_cult;

// === Imports ===
use std::string::{String, utf8};
use sui::{clock::Clock, display, package, table::{Self, Table}};

// === Error Codes ===
const ENotTheFounder: u64 = 1;
const ENotEnoughFaith: u64 = 2;
const EChantOnCooldown: u64 = 3;

// === Constants ===
// 24 hours in milliseconds
const ONE_DAY_MS: u64 = 86_400_000;

// === One-Time Witness ===
public struct MIKU_CULT has drop {}

// === Object Structs ===

public struct CultRegistry has key {
    id: UID,
    cults: Table<ID, String>
}
// A shared object representing a cult that players can join.
public struct CultShrine has key {
    id: UID,
    name: String,
    image_url: String,
    member_count: u64,
    total_faith: u64,
}

// Storable "key" given to the founder of a cult.
public struct CultFounderCap has key {
    id: UID,
    shrine_id: ID
}

// The player's personal NFT, representing their membership and progress.
public struct DevotionAmulet has key {
    id: UID,
    shrine_id: ID,
    personal_faith: u64,
    rank: u64,
    last_chant_timestamp_ms: u64
}

// === Init Function ===
fun init(otw: MIKU_CULT, ctx: &mut TxContext) {
    let registry = CultRegistry {
        id: object::new(ctx),
        cults: table::new(ctx)
    };
    transfer::share_object(registry);

    let publisher = package::claim(otw, ctx);
    let mut display = display::new<DevotionAmulet>(&publisher, ctx);
    display.add(utf8(b"name"), utf8(b"Amulet of Devotion"));
    display.add(utf8(b"description"), utf8(b"A proof of loyalty to the Miku Order"));
    display.add(utf8(b"faith_points"), utf8(b"{personal_faith}"));
    display.add(utf8(b"rank"), utf8(b"{rank}"));
    display.add(utf8(b"image_url"), utf8(b"https://blush-tragic-goat-277.mypinata.cloud/ipfs/bafkreidxq35dgrt7ikghc2mogccomcluusu6ngxvleaxgxm32z2kj7aheq"));
    display.update_version();

    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(display, ctx.sender());
}

public fun update_display_image(
    publisher: &package::Publisher,
    display: &mut display::Display<DevotionAmulet>,
    new_url: String,
) {
    let _ = publisher;

    display.edit(utf8(b"image_url"), new_url);

    display.update_version();
}

// === Public Functions ===

// ===================================================================
// ===           Founder Functions                         ===
// ===================================================================
public fun create_cult(
    registry: &mut CultRegistry, 
    name: String, 
    image_url: String,
    ctx: &mut TxContext
) {
    let shrine = CultShrine {
        id: object::new(ctx),
        name,
        image_url,
        // The founder is the first member
        member_count: 1,
        total_faith: 0
    };
    let shrine_id = object::uid_to_inner(&shrine.id);

    registry.cults.add(shrine_id, shrine.name);

    // Grant FounderCap and Amulet to the creator
    let founder_cap = CultFounderCap {
        id: object::new(ctx),
        shrine_id,
    };
    transfer::transfer(founder_cap, ctx.sender());
    let amulet = DevotionAmulet {
        id: object::new(ctx),
        shrine_id,
        personal_faith: 0,
        rank: 1,
        last_chant_timestamp_ms: 0 
    };
    transfer::transfer(amulet, ctx.sender());

    transfer::share_object(shrine);
}

public fun edit_cult_name(
    founder_cap: &CultFounderCap, 
    shrine: &mut CultShrine, 
    new_name: String, 
) {
    assert!(founder_cap.shrine_id == object::uid_to_inner(&shrine.id), ENotTheFounder);
    shrine.name = new_name;
}

public fun edit_cult_image(
    founder_cap: &CultFounderCap,
    shrine: &mut CultShrine,
    new_image_url: String,
) {
    assert!(founder_cap.shrine_id == object::uid_to_inner(&shrine.id), ENotTheFounder);
    shrine.image_url = new_image_url;
}


// ===================================================================
// ===                  Player Functions                           ===
// ===================================================================
public fun join_cult(
    shrine: &mut CultShrine,
    ctx: &mut TxContext,
) {

    let amulet = DevotionAmulet {
        id: object::new(ctx),
        shrine_id: object::uid_to_inner(&shrine.id),
        personal_faith: 0,
        rank: 1,
        last_chant_timestamp_ms: 0
    };
    shrine.member_count = shrine.member_count + 1;

    transfer::transfer(amulet, ctx.sender());
}

public fun daily_chant(
    amulet: &mut DevotionAmulet, 
    shrine: &mut CultShrine, 
    clock: &Clock
) {
    let current_timestamp = clock.timestamp_ms();
    assert!(current_timestamp >= amulet.last_chant_timestamp_ms + ONE_DAY_MS, EChantOnCooldown);
    amulet.personal_faith = amulet.personal_faith + 10;
    shrine.total_faith = shrine.total_faith + 10;
    amulet.last_chant_timestamp_ms = current_timestamp;
}

public fun rank_up(amulet: &mut DevotionAmulet) {
    if (amulet.rank == 1) {
        assert!(amulet.personal_faith >= 50, ENotEnoughFaith);
        amulet.rank = 2;
        amulet.personal_faith = amulet.personal_faith - 50;
    }
}


// === Test Functions ===
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(MIKU_CULT {}, ctx);
}

// === Getter Functions for Testing ===
#[test_only]
public fun get_shrine_id(shrine: &CultShrine): ID {
    object::uid_to_inner(&shrine.id)
}

#[test_only]
public fun get_founder_cap_shrine_id(cap: &CultFounderCap): ID {
    cap.shrine_id
}

#[test_only]
public fun get_amulet_shrine_id(amulet: &DevotionAmulet): ID {
    amulet.shrine_id
}

#[test_only]
public fun get_amulet_faith(amulet: &DevotionAmulet): u64 {
    amulet.personal_faith
}

#[test_only]
public fun get_amulet_rank(amulet: &DevotionAmulet): u64 {
    amulet.rank
}

#[test_only]
public fun get_shrine_member_count(shrine: &CultShrine): u64 {
    shrine.member_count
}

