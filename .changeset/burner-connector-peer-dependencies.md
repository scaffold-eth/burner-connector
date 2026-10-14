---
"burner-connector": minor
---

Move `viem`, `wagmi` and `@rainbow-me/rainbowkit` from `dependencies` to `peerDependencies` (`^2`), so apps no longer get a second, nested copy of viem/wagmi when their versions differ from the ones burner-connector was built with. Apps must install these packages themselves; Scaffold-ETH 2 and create-eth projects already do.
