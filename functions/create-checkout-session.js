addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request, event))
})

async function handleRequest(request, env) {
    if (request.method !== 'POST') {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload = await request.json();
        const { albumName, albumId, price } = payload;
        if (!albumName || !albumId || !price) {
            return new Response(JSON.stringify({ error: "Missing albumName, albumId, or price" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generate an idempotency key
        const idempotencyKey = crypto.randomUUID();

        // Build payload for Square's Checkout API using snake_case keys
        const checkoutPayload = {
            idempotency_key: idempotencyKey,
            order: {
                location_id: SQUARE_LOCATION_ID,
                line_items: [
                    {
                        name: albumName + " Photo Album",
                        quantity: "1",
                        base_price_money: {
                            amount: price * 100, // square expects price in cents
                            currency: "USD"
                        }
                    }
                ],
                reference_id: albumId,
            },
            checkout_options: {
                redirect_url: `https://photos.chrismuntean.dev/checkout-success/?album=${albumId}`
            }
        };

        // Use the provided Square endpoint
        const squareUrl = "https://connect.squareup.com/v2/online-checkout/payment-links";

        const squareResponse = await fetch(squareUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Square-Version": "2025-02-20"
            },
            body: JSON.stringify(checkoutPayload)
        });

        const result = await squareResponse.json();

        if (!squareResponse.ok) {
            console.error("Square API error:", result);
            return new Response(JSON.stringify(result), {
                status: squareResponse.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Worker error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}  