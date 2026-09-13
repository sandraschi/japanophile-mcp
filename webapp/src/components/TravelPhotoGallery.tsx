import type { TravelPhoto } from "@/content/travelPhotoTypes";
import { KYOTO_PHOTOS } from "@/content/kyotoPhotos";
import { NIKKO_PHOTOS } from "@/content/nikkoPhotos";
import { TOKYO_PHOTOS } from "@/content/tokyoPhotos";
import { useState } from "react";

function PhotoCard({ photo }: { photo: TravelPhoto }) {
	const [src, setSrc] = useState(photo.localSrc);
	const [failedLocal, setFailedLocal] = useState(false);

	return (
		<figure className="overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
			<img
				src={src}
				alt={photo.title}
				className="aspect-[4/3] w-full object-cover"
				loading="lazy"
				onError={() => {
					if (!failedLocal) {
						setFailedLocal(true);
						setSrc(photo.remoteSrc);
					}
				}}
			/>
			<figcaption className="space-y-1 p-3 text-xs text-[var(--app-muted-fg)]">
				<p className="font-medium text-[var(--app-fg)]">{photo.title}</p>
				<p>{photo.caption}</p>
				<p className="text-[10px] opacity-80">
					{photo.credit} · {photo.license}
					{failedLocal ? " · loaded from Commons" : ""}
				</p>
			</figcaption>
		</figure>
	);
}

type GalleryProps = {
	photos: TravelPhoto[];
	testId: string;
};

export function TravelPhotoGallery({ photos, testId }: GalleryProps) {
	return (
		<div
			className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2"
			data-testid={testId}
		>
			{photos.map((p) => (
				<PhotoCard key={p.id} photo={p} />
			))}
		</div>
	);
}

export function NikkoPhotoGallery() {
	return (
		<TravelPhotoGallery photos={NIKKO_PHOTOS} testId="nikko-photo-gallery" />
	);
}

export function TokyoPhotoGallery() {
	return (
		<TravelPhotoGallery photos={TOKYO_PHOTOS} testId="tokyo-photo-gallery" />
	);
}

export function KyotoPhotoGallery() {
	return (
		<TravelPhotoGallery photos={KYOTO_PHOTOS} testId="kyoto-photo-gallery" />
	);
}
