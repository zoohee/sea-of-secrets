package com.ssafy.sos.nft.repository;

import com.ssafy.sos.nft.domain.FileEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends CrudRepository<FileEntity, Long> {
    FileEntity findByTitle(String title);
}
