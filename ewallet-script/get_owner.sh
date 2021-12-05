dig -t txt +noall +answer $1 |grep nft4.domains | cut -f2 -d\" | cut -d\: -f 2
