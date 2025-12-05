import PostEditor from "../PostEditor";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  return <PostEditor mode="edit" postId={id} />;
}
