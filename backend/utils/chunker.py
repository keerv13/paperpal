import tiktoken

def get_token_count(text, model_name="gpt-3.5-turbo"):
    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def chunk_text(text, max_tokens=500, model_name="gpt-3.5-turbo"):
    encoding = tiktoken.encoding_for_model(model_name)

    def tokenize(s): return encoding.encode(s)
    def detokenize(tokens): return encoding.decode(tokens)

    paragraphs = text.split("\n\n")
    chunks = []
    current_tokens = []

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        para_tokens = tokenize(para)

        # If the paragraph itself is larger than max_tokens, split it
        if len(para_tokens) > max_tokens:
            # Flush the current chunk first
            if current_tokens:
                chunks.append(detokenize(current_tokens))
                current_tokens = []

            # Break this long paragraph into multiple chunks
            for i in range(0, len(para_tokens), max_tokens):
                split_tokens = para_tokens[i:i + max_tokens]
                chunks.append(detokenize(split_tokens))

        # Otherwise, try adding it to the current chunk
        elif len(current_tokens) + len(para_tokens) <= max_tokens:
            current_tokens.extend(para_tokens)

        else:
            # Flush current chunk, then start a new one with this paragraph
            chunks.append(detokenize(current_tokens))
            current_tokens = para_tokens

    # Flush final chunk
    if current_tokens:
        chunks.append(detokenize(current_tokens))

    return chunks

def hybrid_chunk_sections(sections_dict, max_tokens=500, model_name="gpt-3.5-turbo"):
    all_chunks = []

    for section_title, content in sections_dict.items():
        section_chunks = chunk_text(content, max_tokens, model_name)
        for i, chunk in enumerate(section_chunks):
            all_chunks.append({
                "section": section_title,
                "chunk_index": i,
                "text": chunk
            })

    return all_chunks
