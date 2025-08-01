module 0x0::miku_cult;

// === Imports ===
use std::string::{String, utf8};
use sui::{display, package};

// === Error Codes ===
const E_NOT_ENOUGH_FAITH: u64 = 1;
const E_NOT_THE_FOUNDER: u64 = 2;

// === One-Time Witness ===
public struct MIKU_CULT has drop {}

// === Object Structs ===
// A shared object representing a cult that players can join.
public struct CultShrine has key {
    id: UID,
    name: String,
    member_count: u64
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
    rank: u64
}

// === Init Function ===
fun init(otw: MIKU_CULT, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);
    let mut display = display::new<DevotionAmulet>(&publisher, ctx);
    display.add(utf8(b"name"), utf8(b"Amulet of Devotion"));
    display.add(utf8(b"description"), utf8(b"A proof of loyalty to the Miku Order. Faith Points: {personal_faith}"));
    display.add(utf8(b"rank"), utf8(b"{rank}"));
    display.add(utf8(b"image_url"), utf8(b"https://blush-tragic-goat-277.mypinata.cloud/ipfs/bafybeifnlypcmpbi74io2kmwzmcj36u4dissoiknwfjnzhwwpgjhht5o5y"));
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
public fun create_cult(name: String, ctx: &mut TxContext) {
    let shrine = CultShrine {
        id: object::new(ctx),
        name: name,
        // The founder is the first member
        member_count: 1
    };

    let shrine_id = object::uid_to_inner(&shrine.id);

    let founder_cap = CultFounderCap {
        id: object::new(ctx),
        shrine_id,
    };
    transfer::transfer(founder_cap, ctx.sender());

    let amulet = DevotionAmulet {
        id: object::new(ctx),
        shrine_id,
        personal_faith: 0,
        rank: 1
    };
    transfer::transfer(amulet, ctx.sender());

    transfer::share_object(shrine);
}

public fun edit_cult_name(
    founder_cap: &CultFounderCap, 
    shrine: &mut CultShrine, 
    new_name: String, 
) {
    assert!(founder_cap.shrine_id == object::uid_to_inner(&shrine.id), E_NOT_THE_FOUNDER);
    shrine.name = new_name;
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
        rank: 1
    };
    shrine.member_count = shrine.member_count + 1;

    transfer::transfer(amulet, ctx.sender());
}

public fun daily_chant(amulet: &mut DevotionAmulet) {
    amulet.personal_faith = amulet.personal_faith + 10
}

public fun rank_up(amulet: &mut DevotionAmulet) {
    if (amulet.rank == 1) {
        assert!(amulet.personal_faith >= 50, E_NOT_ENOUGH_FAITH);
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

