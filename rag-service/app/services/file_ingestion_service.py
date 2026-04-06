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
    def validate_file(cls, file: UploadFile) -> str:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is missing.")

        extension = cls.get_extension(file.filename)

        if extension not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {extension}. Allowed: .txt, .md, .pdf",
            )

        return extension

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

    @staticmethod
    async def read_pdf_file(file: UploadFile) -> str:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

        try:
            reader = PdfReader(BytesIO(content))
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
                extracted_pages.append(page_text)

        text = "\n\n".join(extracted_pages).strip()

        if not text:
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in PDF.",
            )

        return text

    @classmethod
    async def extract_text(cls, file: UploadFile) -> str:
        extension = cls.validate_file(file)

        if extension in {".txt", ".md"}:
            return await cls.read_text_file(file)

        if extension == ".pdf":
            return await cls.read_pdf_file(file)

        raise HTTPException(status_code=400, detail="Unsupported file type.")