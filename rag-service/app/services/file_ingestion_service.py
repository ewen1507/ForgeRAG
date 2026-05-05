import re
from io import BytesIO

from fastapi import UploadFile, HTTPException
from pypdf import PdfReader


class FileIngestionService:
    ALLOWED_EXTENSIONS = {".txt", ".md", ".pdf"}

    @staticmethod
    def get_extension(filename: str) -> str:
        if "." not in filename:
            return ""
        return "." + filename.lower().split(".")[-1]

    @classmethod
    def validate_file(cls, file: UploadFile, fileName) -> str:
        if not fileName:
                raise HTTPException(status_code=400, detail="Filename is missing.")

        extension = cls.get_extension(fileName)
        if extension not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {extension}. Allowed: .txt, .md, .pdf",
            )

        return extension

    @staticmethod
    def clean_pdf_text(text: str) -> str:
        if not text:
            return ""

        # normalisation de base
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # répare les mots coupés en fin de ligne : docu-\nmentation -> documentation
        text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

        # remplace les sauts de ligne simples par des espaces
        text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)

        # garde les paragraphes
        text = re.sub(r"\n{3,}", "\n\n", text)

        lines = []
        for line in text.split("\n"):
            stripped = line.strip()

            if not stripped:
                continue

            # retire lignes purement numériques (souvent numéros de page)
            if re.fullmatch(r"\d+", stripped):
                continue

            # retire patterns du style "123 Python Tutorial, Release 3.6.4"
            if re.fullmatch(r"\d+\s+.*", stripped):
                continue

            # retire lignes très courtes en majuscules (souvent en-têtes / sections parasites)
            if len(stripped) <= 25 and stripped.isupper():
                continue

            lines.append(stripped)

        text = "\n".join(lines)

        # espaces multiples
        text = re.sub(r"[ \t]+", " ", text)

        # espace avant ponctuation
        text = re.sub(r"\s+([,.;:!?])", r"\1", text)

        # compactage final
        text = re.sub(r"\n{3,}", "\n\n", text).strip()

        return text

    @staticmethod
    async def read_text_file(file: UploadFile) -> str:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="File must be UTF-8 encoded.",
            )

    @classmethod
    async def read_pdf_file(cls, file: UploadFile) -> str:
        # content = await file.read()

        if not file:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

        try:
            print("Attempting to read PDF content...")
            reader = PdfReader(BytesIO(file))
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to read PDF file: {str(exc)}",
            )

        extracted_pages: list[str] = []

        for page in reader.pages:
            page_text = page.extract_text() or ""
            page_text = page_text.strip()
            if page_text:
                cleaned = cls.clean_pdf_text(page_text)
                if cleaned:
                    extracted_pages.append(cleaned)

        text = "\n\n".join(extracted_pages).strip()

        if not text:
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in PDF.",
            )

        return text

    @classmethod
    async def extract_text(cls, file: UploadFile, fileName) -> str:
        extension = cls.validate_file(file, fileName)

        print(f"File {fileName} passed validation with extension {extension}")
        if extension in {".txt", ".md"}:
            return await cls.read_text_file(file)

        if extension == ".pdf":
            return await cls.read_pdf_file(file)

        raise HTTPException(status_code=400, detail="Unsupported file type.")