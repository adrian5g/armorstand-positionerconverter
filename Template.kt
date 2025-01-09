val center = player.location.block.location

fun setBlock(item: ItemStack, x: Double, y: Double, z: Double) {
  center.clone().add(x, y, z).block.type = item.type
  center.clone().add(x, y, z).block.data = item.data.data
}

fun summonArmorStand(x: Double, y: Double, z: Double, head: ItemStack, small: Boolean) {
  val location = center.clone().add(x + 0.5, y, z + 0.5)
  val armorStand = center.world.spawnEntity(location, EntityType.ARMOR_STAND) as ArmorStand

  armorStand.apply {
    helmet = ItemStack(head)
    isSmall = small
    isVisible = false
    setArms(false)
    setGravity(false)
    setBasePlate(false)
  }
}

// COLE O CÓDIGO GERADO AQUI!!!