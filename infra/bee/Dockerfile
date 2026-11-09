# Our own Swarm Bee light node (Sepolia testnet) for ADX uploads.
# The node's Ethereum key is injected at start from BEE_SWARM_KEY_JSON (a V3 keystore,
# base64, encrypted with BEE_PASSWORD) so the node address never changes across redeploys.
# Other config comes from BEE_* environment variables on the Railway service.
FROM ethersphere/bee:2.8.3
COPY --chmod=755 infra/bee/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
