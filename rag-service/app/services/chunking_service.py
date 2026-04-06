import re


class ChunkingService:
    @staticmethod
    def normalize_text(text: str) -> str:
        if not text:
            return ""

        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)

        lines = [line.strip() for line in text.split("\n")]
        text = "\n".join(lines).strip()

        return text

    @staticmethod
    def split_paragraphs(text: str) -> list[str]:
        paragraphs = [p.strip() for p in text.split("\n\n")]
        return [p for p in paragraphs if p]

    @staticmethod
    def split_sentences(text: str) -> list[str]:
        text = text.strip()
        if not text:
            return []

        # Split simple sur ponctuation de fin de phrase
        sentences = re.split(r"(?<=[.!?])\s+", text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences

    @staticmethod
    def split_large_text(text: str, max_size: int) -> list[str]:
        text = text.strip()
        if len(text) <= max_size:
            return [text] if text else []

        parts = []
        start = 0

        while start < len(text):
            end = min(start + max_size, len(text))

            if end < len(text):
                last_space = text.rfind(" ", start, end)
                if last_space > start:
                    end = last_space

            chunk = text[start:end].strip()
            if chunk:
                parts.append(chunk)

            if end >= len(text):
                break

            start = end

        return parts

    @staticmethod
    def build_chunks_from_units(
            units: list[str],
            chunk_size: int,
            chunk_overlap: int,
    ) -> list[str]:
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be smaller than chunk_size")

        if not units:
            return []

        chunks: list[str] = []
        current_units: list[str] = []
        current_length = 0

        for unit in units:
            if not unit:
                continue

            unit_length = len(unit)
            separator_length = 1 if current_units else 0
            candidate_length = current_length + separator_length + unit_length

            if candidate_length <= chunk_size:
                current_units.append(unit)
                current_length = candidate_length
                continue

            if current_units:
                chunks.append(" ".join(current_units).strip())

                if chunk_overlap > 0:
                    overlap_units: list[str] = []
                    overlap_length = 0

                    for previous_unit in reversed(current_units):
                        extra_len = len(previous_unit) + (1 if overlap_units else 0)

                        if overlap_units and overlap_length + extra_len > chunk_overlap:
                            break

                        overlap_units.insert(0, previous_unit)
                        overlap_length += extra_len

                    current_units = overlap_units.copy()
                    current_length = len(" ".join(current_units)) if current_units else 0
                else:
                    current_units = []
                    current_length = 0

            if len(unit) > chunk_size:
                if current_units:
                    chunks.append(" ".join(current_units).strip())
                    current_units = []
                    current_length = 0

                split_parts = ChunkingService.split_large_text(unit, chunk_size)
                for part in split_parts[:-1]:
                    chunks.append(part)

                if split_parts:
                    current_units = [split_parts[-1]]
                    current_length = len(split_parts[-1])

            else:
                separator_length = 1 if current_units else 0
                current_units.append(unit)
                current_length += separator_length + unit_length

        if current_units:
            final_chunk = " ".join(current_units).strip()
            if final_chunk:
                chunks.append(final_chunk)

        return chunks

    @classmethod
    def chunk_text(
            cls,
            text: str,
            chunk_size: int = 800,
            chunk_overlap: int = 120,
    ) -> list[str]:
        text = cls.normalize_text(text)
        if not text:
            return []

        paragraphs = cls.split_paragraphs(text)
        final_units: list[str] = []

        for paragraph in paragraphs:
            if len(paragraph) <= chunk_size:
                final_units.append(paragraph)
                continue

            sentences = cls.split_sentences(paragraph)

            if not sentences:
                final_units.extend(cls.split_large_text(paragraph, chunk_size))
                continue

            for sentence in sentences:
                if len(sentence) <= chunk_size:
                    final_units.append(sentence)
                else:
                    final_units.extend(cls.split_large_text(sentence, chunk_size))

        return cls.build_chunks_from_units(
            units=final_units,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )