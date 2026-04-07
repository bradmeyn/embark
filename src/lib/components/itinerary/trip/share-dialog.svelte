<script lang="ts">
	import * as Dialog from '$ui/dialog/index.js';
	import Button from '$ui/button/button.svelte';
	import { Share2, Copy, Check, Trash2, X, UserPlus, Link } from '@lucide/svelte';
	import type { TripWithBasicDays } from '$db/schemas/itinerary';
	import { generateShareLink, revokeShareLink } from '$lib/remotes/share.remote';
	import {
		getCollaborators,
		inviteCollaborator,
		removeCollaborator,
		cancelInvite,
		resendInvite
	} from '$lib/remotes/collaborator.remote';
	import { RotateCcw } from '@lucide/svelte';
	import { env } from '$env/dynamic/public';

	let {
		trip,
		open = $bindable(false),
		showTrigger = true
	}: {
		trip: TripWithBasicDays;
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	let shareToken = $state(trip.shareToken ?? null);
	let copied = $state(false);
	let loading = $state(false);

	const shareUrl = $derived(shareToken ? `${env.PUBLIC_BASE_URL ?? ''}/share/${shareToken}` : null);

	async function handleGenerateLink() {
		loading = true;
		try {
			const result = await generateShareLink({ tripId: trip.id });
			shareToken = result.shareToken;
		} finally {
			loading = false;
		}
	}

	async function handleRevokeLink() {
		loading = true;
		try {
			await revokeShareLink({ tripId: trip.id });
			shareToken = null;
		} finally {
			loading = false;
		}
	}

	async function handleCopyLink() {
		if (!shareUrl) return;
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const collaboratorsData = $derived(await getCollaborators(trip.id));
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger
			class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
		>
			<Share2 class="size-4" />
			<span>Share & Collaborate</span>
		</Dialog.Trigger>
	{/if}
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Share & Collaborate</Dialog.Title>
			<Dialog.Description
				>Share a read-only link or invite collaborators to edit.</Dialog.Description
			>
		</Dialog.Header>

		<div class="space-y-6 py-2">
			<!-- Share link section -->
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<Link class="size-4 text-primary" />
					<h3 class="text-sm font-medium">Share Link</h3>
				</div>

				{#if shareToken && shareUrl}
					<div class="flex items-center gap-2">
						<input
							type="text"
							value={shareUrl}
							readonly
							class="flex-1 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
						/>
						<Button variant="outline" size="icon" onclick={handleCopyLink} class="shrink-0">
							{#if copied}
								<Check class="size-4 text-green-600" />
							{:else}
								<Copy class="size-4" />
							{/if}
						</Button>
					</div>
					<Button
						variant="outline"
						size="sm"
						onclick={handleRevokeLink}
						disabled={loading}
						class="gap-1.5 text-destructive hover:text-destructive"
					>
						<Trash2 class="size-3.5" />
						Revoke link
					</Button>
				{:else}
					<p class="text-sm text-muted-foreground">
						Anyone with the link can view this trip without signing in.
					</p>
					<Button
						variant="outline"
						size="sm"
						onclick={handleGenerateLink}
						disabled={loading}
						class="gap-1.5"
					>
						<Link class="size-3.5" />
						{loading ? 'Generating...' : 'Generate share link'}
					</Button>
				{/if}
			</section>

			<hr />

			<!-- Collaborators section -->
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<UserPlus class="size-4 text-primary" />
					<h3 class="text-sm font-medium">Collaborators</h3>
				</div>

				<!-- Invite form -->
				<form
					{...inviteCollaborator.for(trip.id).enhance(async ({ form, submit }) => {
						await submit();
						if (inviteCollaborator.result?.success) form.reset();
					})}
					class="flex gap-2"
				>
					<input
						{...inviteCollaborator.fields.email.as('email')}
						placeholder="email@example.com"
						class="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
					/>
					<Button type="submit" size="sm" disabled={!!inviteCollaborator.pending} class="gap-1.5">
						{inviteCollaborator.pending ? 'Inviting...' : 'Invite'}
					</Button>
				</form>
				{#each inviteCollaborator.fields.issues() as issue (issue.message)}
					<p class="text-sm text-red-600">{issue.message}</p>
				{/each}

				<!-- Current collaborators & pending invites -->
				<svelte:boundary>
					{#snippet pending()}
						<div class="py-2 text-sm text-muted-foreground">Loading...</div>
					{/snippet}

					{#if collaboratorsData.collaborators.length === 0 && collaboratorsData.pendingInvites.length === 0}
						<p class="text-sm text-muted-foreground">No collaborators yet.</p>
					{:else}
						<ul class="space-y-2">
							{#each collaboratorsData.collaborators as collab (collab.userId)}
								<li class="flex items-center justify-between rounded-md border px-3 py-2">
									<div>
										<p class="text-sm font-medium">{collab.user.name}</p>
										<p class="text-xs text-muted-foreground">{collab.user.email}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										class="size-7 text-destructive hover:bg-destructive/10"
										onclick={() => removeCollaborator({ tripId: trip.id, userId: collab.userId })}
									>
										<X class="size-3.5" />
									</Button>
								</li>
							{/each}
							{#each collaboratorsData.pendingInvites as invite (invite.id)}
								{@const isExpired = new Date(invite.expiresAt) < new Date()}
								<li
									class="flex items-center justify-between rounded-md border border-dashed px-3 py-2"
								>
									<div>
										<p class="text-sm">{invite.invitedEmail}</p>
										{#if isExpired}
											<p class="text-xs text-destructive">Invite expired</p>
										{:else}
											<p class="text-xs text-amber-600">
												Pending · expires {new Date(invite.expiresAt).toLocaleDateString()}
											</p>
										{/if}
									</div>
									<div class="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											class="size-7 text-muted-foreground hover:text-foreground"
											onclick={() => resendInvite({ inviteId: invite.id })}
											title="Resend invite"
										>
											<RotateCcw class="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="size-7 text-destructive hover:bg-destructive/10"
											onclick={() => cancelInvite({ inviteId: invite.id })}
										>
											<X class="size-3.5" />
										</Button>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</svelte:boundary>
			</section>
		</div>
	</Dialog.Content>
</Dialog.Root>
